import { NextApiRequest, NextApiResponse } from 'next'
import { servers } from 'utils/servers'
import logger from 'utils/logger'

export default async function getDeposit(req : NextApiRequest, res: NextApiResponse){
  const { account } = JSON.parse(req.body)

  if(!account || req.method !== 'POST' ){
    logger.error({ account, method: req.method},"Invalid Request")
    res.statusMessage = "Invalid Request"
    res.status(400).json({ message: 'invalid req'})
    return
  }

  const deposit = await fetch(`${servers[ process.env.NODE_ENV ]}/dragon/games/deposit`,{
    method: 'POST',
    headers:{
      'Content-Type': "application/json"
    },
    body: req.body
  })
    .then( data => {
      logger.info( {account, data}, 'Deposit Database Response')
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