import { NextApiRequest, NextApiResponse } from 'next'
import { toWei } from 'web3-utils'
import { servers } from 'utils/servers'

export default async function getBalance(req : NextApiRequest, res: NextApiResponse){
  const { wallet } = req.query

  if(!wallet || req.method !== 'GET' ){
    res.statusMessage = "Invalid Request"
    res.status(400).end()
    return
  }

  await fetch(`${servers[ process.env.NODE_ENV ]}/api/users/wallet/${wallet}`,{
    headers:{
      origin: 'http://localhost:3000'
    }
  })
    .then( d => d.json() )
    .then( data => {
      if( data?.statusCode > 200 )
        res.status(503).json({ message: 'Database is not responding'})
      else
        res.status(200).json({ balance: toWei(`${data.balance || 0}`) })
    } )
    .catch( e => {
      res.status(500).json({ error: e })
    })

}