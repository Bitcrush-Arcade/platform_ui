import { NextApiRequest, NextApiResponse } from 'next'
// Data

const playTimelockActive = async(req: NextApiRequest, res: NextApiResponse)=>{

  const { account } = JSON.parse(req.body)
  if(req.method !=='POST' || !account )
    res.status(400).json({ error: 'Invalid Request' })
  const timeStamp = await fetch( `${process.env.GAMES_API}/dragon/games/getRequestTime`,{
    method: 'POST',
    headers:{
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ account: account })
  })
    .then( r => {
      if(r.status == 200)
        return r.json()
      return { timeStamp: 'error'}
    } )
    .then( d => {
      const typeofTimestamp = typeof(d.timeStamp)
      switch(typeofTimestamp){
        case 'number':
            return d.timeStamp
        default:
            return false
      }
    })
  if( isNaN(timeStamp) ) 
    return res.status(503).json({ origin: 'Game Server', more: 'something Off with server' })

  const isLocked = (timeStamp + 90000) > new Date().getTime()
  res.status(200).json({ lockWithdraw: isLocked })
}

export default playTimelockActive