import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
// Lodash
import find from 'lodash/find'
// Web3
import { useWeb3React } from '@web3-react/core'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// BITCRUSH
import Card from 'components/basics/Card'
import PageContainer from 'components/PageContainer'
import GeneralUseButton from 'components/basics/GeneralUseButton'
// Utils & Types
import { GameSession } from 'types/games/session'


function Game( props: InferGetServerSidePropsType<typeof getServerSideProps> ) {
  const { isBitcrushGame, game } = props

  const css = useStyles()
  const { account } = useWeb3React()

  const [ gameSession, setGameSession ] = useState<GameSession | null>( null )

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

  return (
    <PageContainer menuSm={true}>
      <div className={ css.container}>
        {isBitcrushGame && account
          ? <iframe src={game.url} className={ css.iframe } />
          : <>
            <Typography variant="h3" align="center" paragraph>
              {!account 
                ? "Please connect your wallet before playing"
                : "Are you sure this game is available?"}
            </Typography>
            <Grid container justifyContent="center">
              <Link passHref href="/games">
                <GeneralUseButton color="secondary" background="secondary">
                  Go back to Arcade
                </GeneralUseButton>
              </Link>
            </Grid>
          </>
        }
      </div>
    </PageContainer>
  )
}

export default Game

const games:{ [key: string] : { url: string, name: string }} = {
  diceInvaders: {
    url: 'http://104.219.251.99:5000/',
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
  const { req, query } = context

  const { gameKey } = query
  const keyName = typeof(gameKey) == 'string' ? gameKey : gameKey.join('')
  const bitcrushGame = games[keyName]

  let otherGame: null | any = null;

  if(!bitcrushGame){
    
    const dragonEndpoint = process.env.NODE_ENV == 'development'
      ? 'https://staging-api.dragongaming.com' //DEV
      :  'https://staging-api.dragongaming.com'; //PROD

    const availableGames = await fetch(`${dragonEndpoint}/v1/games/get-games/`,{
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



  return {
    props:{
      isBitcrushGame: !!bitcrushGame,
      game: bitcrushGame || otherGame
    }
  }
}