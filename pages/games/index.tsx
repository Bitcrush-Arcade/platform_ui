import { useState, useMemo, useCallback } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Fab from '@material-ui/core/Fab'
import IconButton from '@material-ui/core/IconButton'
import Slide from '@material-ui/core/Slide'
import Grid from "@material-ui/core/Grid"
import Typography from '@material-ui/core/Typography'
// Icons
import ChevronLeft from "@material-ui/icons/ChevronLeft"
import ChevronRight from "@material-ui/icons/ChevronRight"
// Bitcrush
import Card from 'components/basics/Card'
import Carousel, { CarouselHandles } from 'components/basics/Carousel'
import GameCard from 'components/basics/GameCard'
import Button from 'components/basics/GeneralUseButton'
import SmallButton from 'components/basics/SmallButton'
import PageContainer from 'components/PageContainer'

type GameItem = {
  name: string,
  description: string,
  disabled?: boolean,
  link: string,
  imgSrc: string,
  width: number,
  height: number,
  alt: string,
  local?: boolean
}

const featuredGames : GameItem[] = [
  { 
    name: 'Dice Invaders',
    description: 'Dice Invaders is an updated take on the provably fair dice game. In addition to the traditional over/under style of play, we feature additional inside/outside play, multiple graphic side bets, and separate auto-roll strategies for each parameter individually, all set to a retro gameplay esthetic. ',
    disabled: false,
    link: '/games/diceInvaders',
    imgSrc: '/games/dice_invaders_pv.png',
    width: 2358/6,
    height: 1290/6,
    alt: 'Dice Invaders Game Demo',
    local: true
  },
  {
    name: "Bitcrush Bounty",
    description: `
      Compete against other squad members to make the final bid and win the bounty. When the timer reaches zero, the final member bid wins the game,
      and all the bounty that comes with it!\n
      60% goes to the winner, 30% rolled over to the next round, 5% goes to Wizard Financial for creating this masterpiece, and 5% goes to Bitcrush Arcade reserve to be burned.`,
    disabled: false,
    link: 'https://crush.wizard.financial/',
    imgSrc: '/games/bountyWinner.png',
    width: 824/4,
    height: 640/4,
    alt: "Dragon\'s Den Game"
  }
]

const Games = () => {

  const css = useStyles({})

  const [selectFeaturedGame, setSelectFeaturedGame] = useState<number>(1)
  const [showSlide, setShowSlide] = useState<boolean>(true)

  const selectedGame = useMemo( () => featuredGames[selectFeaturedGame], [selectFeaturedGame])

  const toggleSlide = () => setShowSlide( p => !p )

  const cycleFeatured = () => {
    toggleSlide()
    setTimeout(() => {
      setSelectFeaturedGame( prev => {
        const newVal = prev + 1
        const maxFeatured = featuredGames.length
        if( newVal >= maxFeatured )
          return 0
        return newVal
      })
      toggleSlide()
    }, 300)
  }

  const LeftScroll = (props: {disabled: boolean, onClick: () => void}) => {
    const {disabled, onClick} = props
    return <Button variant="circular" size="small" color="primary" onClick={ onClick} disabled={disabled} background="primary">
    <ChevronLeft/>
  </Button>
  }
  const RightScroll = (props: {disabled: boolean, onClick: () => void}) => {
    const {disabled, onClick} = props
    return <Button variant="circular" size="small" color="primary" onClick={ onClick} disabled={disabled} background="primary">
    <ChevronRight/>
  </Button>
  }

  const featuredButton = 
    <Button width="100%" color="primary" style={{ marginTop: 32 }}
      disabled={selectedGame.disabled}
      solidDisabledText
      href={selectedGame.local ? undefined : selectedGame.link}
      target={selectedGame.local ? undefined : "_blank"}
    >
      {selectedGame.disabled ? "Coming Soon" : "Play Now"}
    </Button>

  return <PageContainer>
     <Head>
      <title>BITCRUSH ARCADE</title>
      <meta name="description" content="A BSC hybrid gaming platform"/>
    </Head>
    <Slide in={showSlide} direction="right">
      <Grid container justifyContent="center" className={ css.featuredContainer } >
        <Grid item className={ css.cardContainer } >
            <Card className={ css.featuredCard } background="light">
                <Grid container direction="row-reverse" alignItems="center" spacing={1}>
                  <Grid item xs={12} md={6}>
                    <Image src={selectedGame.imgSrc} width={selectedGame.width} height={selectedGame.height} layout="responsive" alt={selectedGame.alt}/>
                  </Grid>
                  <Grid item xs={12} md={6} >
                    <div className={ css.textContainer }>
                      <Typography variant="h4" paragraph>
                        {selectedGame.name}
                      </Typography>
                      <Typography variant="body2">
                      {selectedGame.description}
                      </Typography>
                      { selectedGame.local 
                          ? <Link href={selectedGame.link} passHref>
                              {featuredButton}
                            </Link>
                          : featuredButton}
                    </div>
                  </Grid>
                  <Grid item xs={12} container justifyContent="flex-end">
                    <div style={{ marginLeft: 'auto', marginTop: 8, marginRight: 24}}>
                      <SmallButton size="small" color="secondary" variant="extended" onClick={cycleFeatured}>
                        <Typography variant="caption" color="textPrimary" style={{ fontWeight: 600}}>
                          View Other Featured
                        </Typography>
                        <ChevronRight fontSize="inherit" color="inherit" style={{paddingBottom: 4}}/>
                      </SmallButton>
                    </div>
                  </Grid>
                </Grid>
            </Card>
          <div className={ css.featuredTag }>
            <Typography className={ css.tagText }>
              Featured Game
              <IconButton size="small" color="inherit" onClick={cycleFeatured}>
                <ChevronRight fontSize="inherit"/>
              </IconButton>
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Slide>
    <div className={ css.otherGamesContainer }>
      <Typography variant="h6" paragraph>
        Featured Partner :: Dragon Gaming :: Coming Soon
      </Typography>
      <Carousel
        LeftScroll={LeftScroll}
        RightScroll={RightScroll}
        items={games.map( (game, gameIdx) => <GameCard key={`other-game-card-${gameIdx}`} imgSrc={game.src}/>)}
        xs={1}
        sm={1}
        md={2}
        lg={2}
        spacing={3}
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
  // {src: '/games/dragon/mythical_creatures.png'},
  // {src: '/games/dragon/scream.png'},
  // {src: '/games/dragon/the_defenders.png'},
  // {src: '/games/dragon/lucky_macau.png'},
  // {src: '/games/dragon/mythical_creatures.png'},
  // {src: '/games/dragon/scream.png'},
  // {src: '/games/dragon/the_defenders.png'},
  // {src: '/games/dragon/lucky_macau.png'},
  // {src: '/games/dragon/mythical_creatures.png'},
  // {src: '/games/dragon/scream.png'},
  // {src: '/games/dragon/the_defenders.png'},
  // {src: '/games/dragon/lucky_macau.png'},
  // {src: '/games/dragon/mythical_creatures.png'},
  // {src: '/games/dragon/scream.png'},
  // {src: '/games/dragon/the_defenders.png'},
]