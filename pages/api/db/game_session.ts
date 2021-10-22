import { NextApiRequest, NextApiResponse } from 'next'
import { gameApi } from 'utils/servers'

export default async function getGameSession(req : NextApiRequest, res: NextApiResponse){
  
  const { wallet, country } = JSON.parse(req.body)

  if(req.method !== 'POST' || !wallet){
    res.status(400).json({ message: 'Invalid Request'})
    return
  }

  await fetch(`${process.env.GAMES_API}/dragon/games/generate_session`,{
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
    .then( d =>{
      console.log(d)
      return d.json() })
    .then( data => {
      console.log(data)
      if( data?.statusCode > 200 )
        res.status(503).json({ message: 'Database is not responding'})
      else
        res.status(200).json(data)
    } )

}