// Next
import { useRouter } from 'next/router'
// Material
import { makeStyles, createStyles, Theme, useTheme } from "@material-ui/core/styles"
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
// Components
import Logo from 'components/displays/Logo'

const Footer = () => {

  const css = useStyles()
  const router = useRouter()
  const isGame = router.basePath.indexOf('games') > -1
  const logoRoute = isGame ? '/games' : '/'
  const theme = useTheme()
  const isSm = useMediaQuery( theme.breakpoints.down('sm') )
  const logoFactor = isSm ? 26 : 18

  return <footer className={css.footer} >
    <Divider className={ css.divider } />
    <Grid container justifyContent="space-evenly">
      <Grid item xs={12} md={6}>
        <Grid container justifyContent="space-evenly">
          <Grid item>
            COLUMN 1
          </Grid>
          <Grid item>
            COLUMN 2
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Logo
          isGame={ isGame }
          href={logoRoute}
          sizeFactor={logoFactor}
        />
      </Grid>
    </Grid>
  </footer>
}

export default Footer

const useStyles = makeStyles<Theme>( theme => createStyles({
  footer:{
    backgroundColor: theme.palette.background.default
  },
  divider:{
    height: 2,
    backgroundColor: theme.palette.primary.main,
    marginBottom: theme.spacing(6),
  },
}))