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

  useEffect( ()=>{

    console.log('container', pending, completed )

  },[pending, completed])

  useEagerConnect()

  const toggleMenu = () => setMenuToggle( p => !p )

  useEffect(()=>{
    setMenuToggle(!isSm)
  },[isSm])

  return <div>
    <div className={ css.fullContainer }>
      <Header open={menuToggle} toggleOpen={toggleMenu}/>
      <Menu open={menuToggle} toggleOpen={toggleMenu}/>
      <Container maxWidth="xl" className={css.contentContainer}>
        {pending.length > 0 && <LinearProgress/>}
        {children}
      </Container>
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
  fullContainer:{
    transition: theme.transitions.create('background', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundImage: props =>  `url(${backgrounds[theme.palette.type][props.background || 'default']})`,
    backgroundSize: 'cover',
    [theme.breakpoints.down('sm')]:{
      backgroundSize: '200% auto',
      backgroundPosition: 'left calc(100% - 50% + 32px) top 0',
    },
    [theme.breakpoints.up('md')]:{
      backgroundPosition: props => (props.background || 'default') == 'default' ? 
        props.menuToggle ? `left calc( 50% + ${ theme.palette.type =='dark' ? 74 : 120}px) top 0` : `left calc( 50% - ${ theme.palette.type =='dark' ? 12 : 32}px ) top 0`
        : 'top',
    },
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    maxWidth: '100vw',
    position: 'relative',
  },
}))

const backgrounds = {
  dark:{
    default: '/backgrounds/defaultBg.jpg',
    galactic:'/backgrounds/galactic.jpg',
  },
  light:{
    default: '/backgrounds/light/palms.jpg',
    galactic:'/backgrounds/light/cosmic.jpg',
  }
}