import { useRef } from 'react'
import Image from 'next/image'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Container from "@material-ui/core/Container"
import Typography from '@material-ui/core/Typography'
import Grid from "@material-ui/core/Grid"
// Icons
import ChevronLeft from "@material-ui/icons/ChevronLeft"
import ChevronRight from "@material-ui/icons/ChevronRight"
// Bitcrush
import Card from 'components/basics/Card'
import Carousel, { CarouselHandles } from 'components/basics/Carousel'
import GameCard from 'components/basics/GameCard'
import Button from 'components/basics/GeneralUseButton'
import PageContainer from 'components/PageContainer'

const Games = () => {

  const css = useStyles({})
  const gameScrollerRef = useRef<CarouselHandles>(null)

  return <PageContainer>
    <Grid container justify="center" className={ css.featuredContainer } >
      <Grid item className={ css.cardContainer } >
        <Card className={ css.featuredCard } background="light">
          <Grid container direction="row-reverse" alignItems="center" spacing={1}>
            <Grid item xs={12} md={6}>
              <Image src={'/games/dice_invaders_pv.png'} width={2358/6} height={1290/6} layout="responsive"/>
            </Grid>
            <Grid item xs={12} md={6} >
              <div className={ css.textContainer }>
                <Typography variant="h4" paragraph>
                  Dice Invaders
                </Typography>
                <Typography variant="body2">
                  Stake Crush Coins to earn APY as well as a portion of the house edge.
                  Staking not only helps stabilize the Crush Economy, it also provides Bankroll for the games. Because of the nature of gambling, this is more resky, but restuls in higher rewards than traditional staking.
                </Typography>
                <Button width="100%" color="primary" style={{ marginTop: 32 }}>
                  Play
                </Button>
              </div>
            </Grid>
          </Grid>
        </Card>
        <div className={ css.featuredTag }>
          <Typography className={ css.tagText }>
            Featured Game
          </Typography>
        </div>
      </Grid>
    </Grid>
    <div className={ css.otherGamesContainer }>
      <Grid container justify="space-between" alignItems="center" className={ css.otherGamesTitle } >
        <Grid item>
          <Typography variant="h6">
            Featured Partner :: Dragon Gaming
          </Typography>
        </Grid>
        <Grid item>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="round" size="small" color="primary" onClick={ gameScrollerRef.current?.scrollPrev }>
                <ChevronLeft/>
              </Button>
            </Grid>
            <Grid item>
              <Button variant="round" size="small" color="primary" onClick={ gameScrollerRef.current?.scrollNext }>
                <ChevronRight/>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Carousel ref={gameScrollerRef}
        otherScroll
        items={games.map( (game, gameIdx) => <GameCard key={`other-game-card-${gameIdx}`} imgSrc={game.src}/>)}
        xs={1}
        sm={2}
        md={4}
        lg={6}
      />
    </div>
  </PageContainer>
}

export default Games

const useStyles = makeStyles<Theme>( theme => createStyles({
  featuredContainer:{
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  featuredCard:{
    padding: theme.spacing(4),
    maxWidth: 980,
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]:{
      maxWidth: 480
    }
  },
  textContainer:{
    paddingRight: theme.spacing(6),
    position: 'relative',
    [theme.breakpoints.down('sm')]:{
      paddingTop: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
    },
  },
  cardContainer:{
    position: 'relative',
  },
  featuredTag:{
    position: 'absolute',
    top: -30,
    left: 40,
    zIndex:0,
    background: `linear-gradient( 270deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.light} 100%)`,
    padding: theme.spacing(0.5),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(2),
    borderTopLeftRadius: theme.spacing(4),
  },
  tagText:{
    textTransform:'uppercase',
    fontWeight: 600,
  },
  otherGamesTitle:{
    marginBottom: theme.spacing(2),
  },
  otherGamesContainer:{
    padding: theme.spacing(4),
  },
}))
// TEST GAMES
const games = [
  {src: '/games/dragon/lucky_macau.png'},
  {src: '/games/dragon/mythical_creatures.png'},
  {src: '/games/dragon/scream.png'},
  {src: '/games/dragon/the_defenders.png'},
  {src: '/games/dragon/lucky_macau.png'},
  {src: '/games/dragon/mythical_creatures.png'},
  {src: '/games/dragon/scream.png'},
  {src: '/games/dragon/the_defenders.png'},
  {src: '/games/dragon/lucky_macau.png'},
  {src: '/games/dragon/mythical_creatures.png'},
  {src: '/games/dragon/scream.png'},
  {src: '/games/dragon/the_defenders.png'},
  {src: '/games/dragon/lucky_macau.png'},
  {src: '/games/dragon/mythical_creatures.png'},
  {src: '/games/dragon/scream.png'},
  {src: '/games/dragon/the_defenders.png'},
  {src: '/games/dragon/lucky_macau.png'},
  {src: '/games/dragon/mythical_creatures.png'},
  {src: '/games/dragon/scream.png'},
  {src: '/games/dragon/the_defenders.png'},
  {src: '/games/dragon/lucky_macau.png'},
  {src: '/games/dragon/mythical_creatures.png'},
  {src: '/games/dragon/scream.png'},
  {src: '/games/dragon/the_defenders.png'},
]