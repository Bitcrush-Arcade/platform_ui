// React
import { useState, ReactNode } from 'react'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
// Components
import Header from 'components/HeaderBar'
import Menu from 'components/Menu'

const PageContainer = ( props: { children?: ReactNode, fullPage?: boolean }) => {
  const { children, fullPage } = props
  const [menuToggle, setMenuToggle] = useState<boolean>(true)
  const css = useStyles({ menuToggle })

  const toggleMenu = () => setMenuToggle( p => !p )
  return<>
    <Header open={menuToggle} toggleOpen={toggleMenu}/>
    <Menu open={menuToggle} toggleOpen={toggleMenu}/>
    <Container maxWidth="lg" className={css.container}>
      {children}
    </Container>
  </>
}

export default PageContainer

const useStyles = makeStyles<Theme, { menuToggle: boolean, fullPage?: boolean }>( (theme: Theme) => createStyles({
  container:{
    marginTop: props => props.fullPage ? 0 : 96,
    paddingLeft: props => props.menuToggle ? theme.spacing(30) : theme.spacing(9),
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }
}))