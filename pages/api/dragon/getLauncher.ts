import { NextApiRequest, NextApiResponse } from 'next'
import { dragonEp } from 'utils/servers'

export default async function getLauncher(req : NextApiRequest, res: NextApiResponse){
  const { game, sessionData, type = "mobile" } = JSON.parse(req.body)
  // verify valid request
  if(req.method !== 'POST' || !game || !sessionData){
    return res.status(400).json({ message: 'Invalid Request' })
  }
  const dragonKey = process.env.DRAGON_KEY
  // Get launcher URL
  const urlBuild = {
    api_key: dragonKey,
    session_id: sessionData.token,
    provider: game.supplier,
    game_type: game.category,
    game_id: game.game_id,
    platform: type,
    language: 'en',
    amount_type: 'real',
    lobby_url: '',
    deposit_url: '',
    context:{
      id: sessionData.account_id,
      username: sessionData.username,
      country: sessionData.country,
      currency: 'Crush',
    }
  }

  // const url = `${dragonEp.getLauncher[process.env.NODE_ENV]}`;
  const url = `${dragonEp.getLauncher["production"]}`;
  let status : number;

  await fetch( url,{
    method: "post",
    headers:{
      "Content-Type": "application/json",
    },
    body: JSON.stringify( urlBuild ),
  } )
  .then( d =>{ 
    console.log(d)
    status = d.status
    return d.json() 
  })
  .then( r => { 
    if( status > 200)
      res.status(400).json( { error: r, message: "Dragon Gaming Error" } )
    else{
      res.status(status).json( { launcherUrl: r.result.launch_url } )
    }
  })
  .catch( e => {
    res.status(400).json({ message: "Unknown Error", e})
  })


}