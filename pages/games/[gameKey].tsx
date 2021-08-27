import { useRouter } from 'next/router'
import Link from 'next/link'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// BITCRUSH
import Card from 'components/basics/Card'
import PageContainer from 'components/PageContainer'
import GeneralUseButton from 'components/basics/GeneralUseButton'

function Game( ) {
  const router = useRouter()
  const css = useStyles()

  const gameKey = router.query.gameKey
  const gameKeyString = Array.isArray(gameKey) ? gameKey.join('') : gameKey
  const selectedGame = games[gameKeyString]
  return (
    <PageContainer menuSm={true}>
      <div className={ css.container}>
        {selectedGame 
          ? <iframe src={selectedGame.url} className={ css.iframe } />
          : <>
            <Typography variant="h3" align="center" paragraph>
              Are you sure this game is available?
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