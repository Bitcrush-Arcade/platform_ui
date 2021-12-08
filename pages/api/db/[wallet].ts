import { NextApiRequest, NextApiResponse } from 'next'
import { toWei } from 'web3-utils'
import { servers } from 'utils/servers'
import BigNumber from 'bignumber.js'

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
      console.log(data)
      if( data?.statusCode > 200 )
        res.status(503).json({ message: 'Database is not responding'})
      else
        res.status(200).json({ balance: toWei(`${new BigNumber(data.balance || 0).toFixed(18,1) }`) })
    } )
    .catch( e =>{
      res.status(503).json({ error: e, balance: -1 })
    })

}