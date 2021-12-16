import { getRpcUrl } from 'data/rpc'
import { NextApiRequest, NextApiResponse } from 'next'
import Web3 from 'web3'

export default async function getGameSession(req : NextApiRequest, res: NextApiResponse){
  
  const { wallet, country, signed } = JSON.parse(req.body)

  if(req.method !== 'POST' || !wallet){
    res.status(400).json({ message: 'Invalid Request'})
    return
  }

  const web3 = new Web3( new Web3.providers.HttpProvider( getRpcUrl(56) || 'https://bsc-dataseed1.defibit.io/') )
  console.log(JSON.parse(req.body))
  const usedAccount = await web3.eth.accounts.recover(signed.msg, signed.signature)
  if(usedAccount !== wallet)
    return res.status(401).json({error: 'Unauthorized wallet'})

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
      if( data?.statusCode > 200 )
        res.status(503).json({ message: 'Database is not responding', e: data})
      else
        res.status(200).json(data)
    } )
    .catch( e => {
      res.status(500).json({ message: 'Failure', e})
    })

}