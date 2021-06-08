// React
import { useState, ReactNode } from 'react'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
// Components
import Header from 'components/HeaderBar'
import Menu from 'components/Menu'
// Hooks
import { useEagerConnect } from 'hooks/web3Hooks'
// Utils
import { styledBy } from 'utils/styles/styling'

const PageContainer = ( props: ContainerProps ) => {
  const { children } = props
  const [menuToggle, setMenuToggle] = useState<boolean>(true)
  const css = useStyles({ menuToggle, ...props })

  useEagerConnect()

  const toggleMenu = () => setMenuToggle( p => !p )
  return <div className={ css.fullContainer }>
    <Header open={menuToggle} toggleOpen={toggleMenu}/>
    <Menu open={menuToggle} toggleOpen={toggleMenu}/>
    <Container maxWidth="xl" className={css.contentContainer}>
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
    paddingLeft: props => props.menuToggle ? theme.spacing(33) : theme.spacing(12),
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