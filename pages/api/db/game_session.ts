import { NextApiRequest, NextApiResponse } from 'next'
import { gameApi } from 'utils/servers'

export default async function getGameSession(req : NextApiRequest, res: NextApiResponse){
  
  const { wallet, country } = JSON.parse(req.body)

  if(req.method !== 'POST' || !wallet){
    res.status(400).json({ message: 'Invalid Request'})
    return
  }

  await fetch(`${gameApi[ process.env.NODE_ENV ]}/api/dragon/games/generate_session`,{
    method: 'POST',
    headers:{
      origin: 'http://localhost:3000',
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({
      wallet_address: wallet,
      country: country
    })
  })
    .then( d => d.json() )
    .then( data => {
      if( data?.statusCode > 200 )
        res.status(503).json({ message: 'Database is not responding'})
      else
        res.status(200).json(data)
    } )

}