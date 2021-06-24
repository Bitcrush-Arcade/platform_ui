// React
import { useState, ReactNode, useEffect, useContext } from 'react'
import Image from 'next/image'
// Material
import { makeStyles, createStyles, Theme, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import LinearProgress from "@material-ui/core/LinearProgress"
import Container from '@material-ui/core/Container'
// Components
import Header from 'components/HeaderBar'
import Menu from 'components/Menu'
// Hooks
import { useEagerConnect } from 'hooks/web3Hooks'
// Utils
import { styledBy } from 'utils/styles/styling'
// Context
import { TransactionContext } from 'components/context/TransactionContext'

const PageContainer = ( props: ContainerProps ) => {
  
  const { children } = props
  
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [menuToggle, setMenuToggle] = useState<boolean>(!isSm)
  
  const css = useStyles({ menuToggle, ...props })

  const { pending, completed } = useContext(TransactionContext)

  const backgroundImgSrc = props.background !== 'galactic' 
    ? { url: "/backgrounds/CenteredBaseBackground.png", width: 1615, height: 944}
    : { url: "/backgrounds/Galactic.jpg", width: 1920, height: 1467 }

  useEffect( ()=>{

    console.log('container', pending, completed )

  },[pending, completed])

  useEagerConnect()

  const toggleMenu = () => setMenuToggle( p => !p )

  useEffect(()=>{
    setMenuToggle(!isSm)
  },[isSm])

  return <div className={ css.fullContainer }>
    <Header open={menuToggle} toggleOpen={toggleMenu}/>
    <Menu open={menuToggle} toggleOpen={toggleMenu}/>
    <Container maxWidth="xl" className={css.contentContainer}>
      {pending.length > 0 && <LinearProgress/>}
      {children}
    </Container>
    <div className={css.img}>
      <Image src={backgroundImgSrc.url} layout="responsive" width={backgroundImgSrc.width} height={backgroundImgSrc.height} />
    </div>
  </div>
}

export default PageContainer

type ContainerProps ={
  children?: ReactNode,
  fullPage?: boolean,
  background?: 'default' | 'galactic'
}

const useStyles = makeStyles<Theme, { menuToggle: boolean } & ContainerProps >( (theme: Theme) => createStyles({
  contentContainer:{
    paddingTop: props => props.fullPage ? 0 : 96,
    paddingLeft: theme.spacing(12),
    [theme.breakpoints.up('md')]:{
      paddingLeft: props => props.menuToggle ? theme.spacing(33) : theme.spacing(12),
    },
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  img:{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    paddingLeft: props => props.background == 'galactic' ? 0
      : theme.spacing(9),
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.up('md')]:{
      paddingLeft: props => props.background!== 'galactic'
        ? props.menuToggle ? theme.spacing(30) : theme.spacing(9)
        : 0,
    },
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    background: props=> props.background =='galactic' ? undefined : `linear-gradient( 180deg, ${theme.palette.background.default} 0%, rgb(0,0,0) 40%, rgb(0,0,0) 95%, ${theme.palette.background.default} 100%)`
  },
  fullContainer:{
    minHeight: '100vh',
    maxWidth: '100vw',
    position: 'relative',
  },
}))