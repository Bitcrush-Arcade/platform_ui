import { NextApiRequest, NextApiResponse } from 'next'
import { servers } from 'utils/servers'
import logger from 'utils/logger'

export default async function getDeposit(req : NextApiRequest, res: NextApiResponse){
  const { account, amount, negative } = JSON.parse(req.body)

  if(!account || req.method !== 'POST' || !amount || typeof(negative) !== "boolean" ){
    logger.error({ account, method: req.method},"Invalid Request")
    res.statusMessage = "Invalid Request"
    res.status(400).json({ message: 'invalid req', body: {account, amount, negative }})
    return
  }
  const sentData = {
    wallet_address: account,
    amount: parseFloat(amount),
    negative,
  }

  const deposit = await fetch(`http://diceinvaders.bitcrush.com:3000/dragon/games/deposit`,{
    method: 'POST',
    headers:{
      'Content-Type': "application/json"
    },
    body: JSON.stringify(sentData)
  })
    .then( data => {
      logger.info( {account, amount, negative, data}, 'Deposit Database Response')
      return { msg: 'ok', data }
    } )
    .catch( e =>{
      logger.error({ account, ...e },"database error")
      return{ msg: 'err', data: e}
    })
    if(deposit.msg !== 'ok')
      res.status(400).json({ error: deposit?.data|| 'error' })
    res.status(200).json({ message: 'success', deposit})

}