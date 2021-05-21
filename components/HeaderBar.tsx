
// Material
import AppBar from '@material-ui/core/AppBar'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'

const HeaderBar = ( props: {open: boolean, toggleOpen: () => void } ) => {


  return <AppBar>
    <Toolbar>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          MENU TOGGLE AND LOGO
        </Grid>
        <Grid item>
          LIVE WALLET
          CRUSH TOKEN (FROM COIN)
          CONNECT WALLET INDICATOR
          PROFILE (?)
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
}