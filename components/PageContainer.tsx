// React
import { useState, ReactNode, useEffect, useContext } from 'react'
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

  return <div className={ css.fullContainer }>
    <Header open={menuToggle} toggleOpen={toggleMenu}/>
    <Menu open={menuToggle} toggleOpen={toggleMenu}/>
    <Container maxWidth="xl" className={css.contentContainer}>
      {pending.length > 0 && <LinearProgress/>}
      {children}
    </Container>
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
    backgroundImage: styledBy( 'background', {
      default: 'url("/backgrounds/BaseBackground.jpg")',
      galactic: 'url("/backgrounds/Galactic.jpg")',
    }),
    minHeight: '100vh',
    backgroundPosition: 'top left',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  }
}))