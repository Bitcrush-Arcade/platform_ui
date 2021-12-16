import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
// Lodash
import find from 'lodash/find'
// Material
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import IconButton from '@mui/material/IconButton'
import LinearProgress from "@mui/material/LinearProgress"
import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
// Icons
import BackIcon from '@mui/icons-material/PlayCircleFilledOutlined';
// BITCRUSH
import PageContainer from 'components/PageContainer'
import GeneralUseButton from 'components/basics/GeneralUseButton'
// Utils & Types
import { GameSession } from 'types/games/session'
import { dragonEp } from 'utils/servers'
import { pink } from '@mui/material/colors';
import { useTransactionContext } from 'hooks/contextHooks'
// Web3
import { useWeb3React } from '@web3-react/core'
import Web3 from 'web3'

const web3 = new Web3(Web3.givenProvider)

function Game( props: InferGetServerSidePropsType<typeof getServerSideProps> ) {
  const { isBitcrushGame, game } = props
  const router = useRouter()
  const css = useStyles()
  const { account } = useWeb3React()

  const [ gameSession, setGameSession ] = useState<GameSession | null>( null )
  const [ launchURL, setLaunchURL ] = useState<string | null>( null )
  const [ errorMessage, setErrorMessage ] = useState<string | null>( null )

  useEffect(() => {
    if(!account || !!gameSession || isBitcrushGame || !game) return
    const textMsg = `I want to play ${game.game_name} with my account ${account}`
    const signMessage = web3.utils.toHex(textMsg)
    web3.eth.personal.sign(signMessage, account, "",
      (e, signature) => {
        if(e) 
          return setErrorMessage('Something went wrong with getting session. Please reload to try again')
        fetch('/api/db/game_session',{
          method: 'POST',
          body: JSON.stringify({
            wallet: account,
            country: router.query?.country || 'CR',
            signed: { msg: textMsg, signature: signature}
          })
        })
          .then( d => d.json() )
          .then( sessionData => setGameSession( sessionData ) )
          .catch( e => {
            console.log(e)
            setErrorMessage(`Something went wrong getting session, contact a Dev code${e.status}`)
          })
      }
    
    )

  },[account, gameSession, setGameSession, isBitcrushGame, game, router.query])

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
        {
          !account || !game || errorMessage ?
          <>
            <Typography variant="h3" align="center" paragraph>
              {! account && "Please connect your wallet before playing"}
              {! game && "This game doesn't seem to be available, please try another one."}
              {errorMessage}
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
            { 
              !isBitcrushGame &&
              <>
                {
                  !launchURL &&
                  <Typography variant="h3" align="center" paragraph>
                    {game.game_title}
                  </Typography>
                }
                { 
                  launchURL 
                  ? <iframe src={launchURL} className={css.iframe} />
                  : <LinearProgress color="secondary" />
                }
              </>
            }
            {
              (isBitcrushGame || launchURL) &&
              <div className={css.closeContainer}>
                <Tooltip title={<Typography>Back to Arcade</Typography>}>
                  <Link passHref href="/games">
                    <IconButton className={css.closeButton} size="small">
                      <BackIcon fontSize="inherit" style={{transform: 'rotate(180deg)', color: pink.A200}}/>
                    </IconButton>
                  </Link>
                </Tooltip>
              </div>
            }
          </>
        }
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
    width: `calc((100vw) - ${theme.spacing(6)})`,
    height: 'calc(100vh)',
    border: 'none',
  },
  container:{
    maxWidth: `calc( 100vw - ${theme.spacing(6)} )`,
    position: 'relative',
  },
  closeContainer:{
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  closeButton:{
    backgroundColor: theme.palette.common.white,
    fontSize: theme.typography.h2.fontSize
  }
}))

export const getServerSideProps: GetServerSideProps = async( context ) => {
  const { query, res } = context

  const { gameKey } = query
  const keyName = gameKey && (typeof(gameKey) == 'string' ? gameKey : gameKey.join(''))
  if(!keyName)
    return {
      notFound: true
    }
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