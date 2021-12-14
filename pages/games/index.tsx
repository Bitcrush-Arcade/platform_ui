import { useState, useMemo } from 'react'
import { InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import shuffle from 'lodash/shuffle'
import compact from 'lodash/compact'
// Material
import { Theme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import Grid from "@mui/material/Grid"
import Typography from '@mui/material/Typography'
// Icons
import ChevronLeft from "@mui/icons-material/ChevronLeft"
import ChevronRight from "@mui/icons-material/ChevronRight"
// Bitcrush
import Card from 'components/basics/Card'
import Carousel, { CarouselHandles } from 'components/basics/Carousel'
import GameCard from 'components/basics/GameCard'
import Button from 'components/basics/GeneralUseButton'
import SmallButton from 'components/basics/SmallButton'
import PageContainer from 'components/PageContainer'
// Utils
import { flattenObject } from 'utils/objects'
// Data
import { dragonEp } from 'utils/servers'

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
    name: 'Dice Invaders - Beta',
    description: 'Dice Invaders [BETA] is an updated take on the provably fair dice game. In addition to the traditional over/under style of play, we feature additional inside/outside play, multiple graphic side bets, and separate auto-roll strategies for each parameter individually, all set to a retro gameplay esthetic. ',
    disabled: true,
    link: '/games/diceInvaders',
    imgSrc: '/games/dice_invaders_pv.png',
    width: 2358/6,
    height: 1290/6,
    alt: 'Dice Invaders Game Demo',
    local: true
  },
  // {
  //   name: "Bitcrush Bounty",
  //   description: `
  //     Compete against other squad members to make the final bid and win the bounty. When the timer reaches zero, the final member bid wins the game,
  //     and all the bounty that comes with it!\n
  //     60% goes to the winner, 30% rolled over to the next round, 5% goes to Wizard Financial for creating this masterpiece, and 5% goes to Bitcrush Arcade reserve to be burned.`,
  //   disabled: false,
  //   link: 'https://crush.wizard.financial/',
  //   imgSrc: '/games/bountyWinner.png',
  //   width: 824/4,
  //   height: 640/4,
  //   alt: "Dragon\'s Den Game"
  // }
]

const Games = ( props: InferGetServerSidePropsType<typeof getServerSideProps> ) => {
  const { allGames, gamesByType, popGames } = props
  const css = useStyles({})
  const [selectFeaturedGame, setSelectFeaturedGame] = useState<number>(0)
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

  const moreFeatured = featuredGames.length > 1

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
                  {moreFeatured && <Grid item xs={12} container justifyContent="flex-end">
                    <div style={{ marginLeft: 'auto', marginTop: 8, marginRight: 24}}>
                      <SmallButton size="small" color="secondary" variant="extended" onClick={cycleFeatured}>
                        <Typography variant="caption" color="textPrimary" style={{ fontWeight: 600}}>
                          View Other Featured
                        </Typography>
                        <ChevronRight fontSize="inherit" color="inherit" style={{paddingBottom: 4}}/>
                      </SmallButton>
                    </div>
                  </Grid>}
                </Grid>
            </Card>
          <div className={ css.featuredTag }>
            <Typography className={ css.tagText }>
              Featured Game
              {moreFeatured &&<IconButton size="small" color="inherit" onClick={cycleFeatured}>
                <ChevronRight fontSize="inherit"/>
              </IconButton>}
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Slide>
    <div className={ css.otherGamesContainer } key={`games-of-the-day-container`}>
      <Typography variant="h6" paragraph>
        Popular Games
      </Typography>
      <Carousel
        LeftScroll={LeftScroll}
        RightScroll={RightScroll}
        items={popGames.map( (game, gameIdx) => <GameCard key={`${game.game_title}-${gameIdx}`} imgSrc={game.logos[0].url} gameKey={game.game_name}/>)}
        xs={1}
        sm={2}
        md={3}
        lg={5}
        spacing={3}
      />
    </div>
    <div className={ css.otherGamesContainer } key={`table-games-container`}>
      <Typography variant="h6" paragraph>
        Table Games
      </Typography>
      <Carousel
        LeftScroll={LeftScroll}
        RightScroll={RightScroll}
        items={gamesByType[1].map( (game, gameIdx) => <GameCard key={`${game.game_title}-${gameIdx}`} imgSrc={game.logos[0].url} gameKey={game.game_name}/>)}
        xs={1}
        sm={2}
        md={3}
        lg={5}
        spacing={3}
      />
    </div>
    <div className={ css.otherGamesContainer } key={`all-games-container`}>
      <Typography variant="h6" paragraph>
        All Games
      </Typography>
      <Grid container justifyContent="space-evenly">
        { allGames.map( (game, gameIdx) => {
          return <Grid item key={`all-games-${gameIdx}`} style={{paddingBottom: 16}}>
            <GameCard imgSrc={game.logos[0].url} gameKey={game.game_name}/>
          </Grid>
        })}
      </Grid>
    </div>
  </PageContainer>
}

export default Games

export const getServerSideProps = async() =>{

  // const dragonEndpoint = dragonEp.getGames[process.env.NODE_ENV]; 
  const dragonEndpoint = dragonEp.getGames['production']; 
  
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

  const allGames = []
  const gamesByType = compact( gameTypes.map( (gameType, typeIndex) => {
    return  availableGames?.result[ gameType ].map( game => {
      const flatGame = flattenObject( game, 1 )
      allGames.push(flatGame)
      return flatGame
    } )
  }))

  return {
    props:{
      gameTypes: gameTypes,
      gamesByType: gamesByType,
      allGames,
      popGames: shuffle(allGames).slice(0,5),
    },
  }
}

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
    [theme.breakpoints.down('md')]:{
      maxWidth: 480
    }
  },
  textContainer:{
    paddingRight: theme.spacing(6),
    position: 'relative',
    [theme.breakpoints.down('md')]:{
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
