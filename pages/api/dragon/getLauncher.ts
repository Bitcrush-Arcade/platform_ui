import { NextApiRequest, NextApiResponse } from 'next'
import { dragonEp } from 'utils/servers'

export default async function getLauncher(req : NextApiRequest, res: NextApiResponse){
  const reqBody = JSON.parse(req.body)
  // verify valid request
  if(req.method !== 'POST' || !reqBody.game )
    return res.status(400).json({ message: 'Invalid Request' })
  // Get launcher URL
  
}