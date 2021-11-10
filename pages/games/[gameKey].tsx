import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
// Lodash
import find from 'lodash/find'
// Web3
import { useWeb3React } from '@web3-react/core'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import LinearProgress from "@material-ui/core/LinearProgress"
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// BITCRUSH
import Card from 'components/basics/Card'
import PageContainer from 'components/PageContainer'
import GeneralUseButton from 'components/basics/GeneralUseButton'
// Utils & Types
import { GameSession } from 'types/games/session'
import { dragonEp } from 'utils/servers'
import getLauncher from 'pages/api/dragon/getLauncher'


function Game( props: InferGetServerSidePropsType<typeof getServerSideProps> ) {
  const { isBitcrushGame, game } = props

  const css = useStyles()
  const { account } = useWeb3React()

  const [ gameSession, setGameSession ] = useState<GameSession | null>( null )
  const [ launchURL, setLaunchURL ] = useState<string | null>( null )

  useEffect(() => {
    if(!account || !!gameSession || isBitcrushGame || !game) return

    fetch('/api/db/game_session',{
      method: 'POST',
      body: JSON.stringify({
        wallet: account,
        country: 'CR'//TODO GET ACTUAL COUNTRY FROM IP ADDRESS
      })
    })
      .then( d => d.json() )
      .then( sessionData => setGameSession( sessionData ) )

  },[account, gameSession, setGameSession, isBitcrushGame, game])

  const getLauncherUrl = useCallback( async () => {
    if(!gameSession || !account || !game || launchURL) return
    await fetch( '/api/dragon/getLauncher' , {
      method: 'POST',
      body: JSON.stringify({ game: game, sessionData: gameSession, type: 'desktop'})
    })
    .then( r => r.json() )
    .then( d => setLaunchURL( d.launcherUrl ))

  },[gameSession, account, game, launchURL, setLaunchURL])

  useEffect(() => {
    if( !gameSession || launchURL || isBitcrushGame ) return
    getLauncherUrl()

  },[isBitcrushGame, gameSession, launchURL, setLaunchURL, game, getLauncherUrl ])

  return (
    <PageContainer menuSm={true}>
      <div className={ css.container}>
        {!account || !game ? <>
          <Typography variant="h3" align="center" paragraph>
            {! account && "Please connect your wallet before playing"}
            {! game && "This game doesn't seem to be available, please try another one."}
          </Typography>
          <Grid container justifyContent="center">
            <Link passHref href="/games">
              <GeneralUseButton color="secondary" background="secondary">
                Go back to Arcade
              </GeneralUseButton>
            </Link>
          </Grid>
        </>
        :<>
        { isBitcrushGame && <iframe src={game.url} className={ css.iframe } /> }
        { !isBitcrushGame && <>
          {!launchURL && <>
            <Typography variant="h3" align="center" paragraph>
              {game.game_title}
            </Typography>
          </>}
          { launchURL 
          ? <>
            <iframe src={launchURL} className={css.iframe} />
          </>
          : <LinearProgress color="secondary" />}
        </>}
        </>}
      </div>
    </PageContainer>
  )
}

export default Game

const games:{ [key: string] : { url: string, name: string }} = {
  diceInvaders: {
    url: 'https://diceinvaders.bitcrush.com/',
    name: 'Dice Invaders'
  }
}

const useStyles = makeStyles<Theme>(theme => createStyles({
  iframe:{
    width: `calc((100vw) - ${theme.spacing(6)}px)`,
    height: 'calc(100vh)',
    border: 'none',
  },
  container:{
    maxWidth: `calc( 100vw - ${theme.spacing(6)}px )`
  }
}))

export const getServerSideProps: GetServerSideProps = async( context ) => {
  const { query, res } = context

  const { gameKey } = query
  const keyName = typeof(gameKey) == 'string' ? gameKey : gameKey.join('')
  const bitcrushGame = games[keyName]

  let otherGame: null | any = null;

  if(!bitcrushGame){
    if( process.env.DOWN_DRAGON !== "0"){
      return {
        redirect: {
          destination: '/maintenance',
          permanent: false
        }
      }
    }
    // const dragonEndpoint = dragonEp.getGames[process.env.NODE_ENV]
    const dragonEndpoint = dragonEp.getGames['production']

    const availableGames = await fetch( dragonEndpoint ,{
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: process.env.DRAGON_KEY
      })
    })
      .then( d => {
        return d.json()
      } )
      .then( data => {
        return data
      })
      .catch( e => {
        console.log(e)
        return []
      })
      const gameTypes = Object.keys(availableGames?.result || {})
      gameTypes.map( gameType => {
        const gameFound = find(availableGames?.result[gameType], o => !! o[keyName] )
        if(gameFound)
          otherGame = gameFound[keyName]
      })
  }
  else if( process.env.DOWN_DI !== "0"){
    return {
      redirect: {
        destination: '/maintenance',
        permanent: false
      }
    }
  }



  return {
    props:{
      isBitcrushGame: !!bitcrushGame,
      game: bitcrushGame || otherGame
    }
  }
}