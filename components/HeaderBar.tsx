import Link from 'next/link'
import Image from 'next/image'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'
// Icons
import MenuIcon from '@material-ui/icons/Menu';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';

const HeaderBar = ( props: {open: boolean, toggleOpen: () => void } ) => {
  const css = useStyles({})
  const { open, toggleOpen } = props

  const imgReducer = 18

  return <AppBar color="transparent" className={css.appBar} variant="outlined">
    <Toolbar>
      <Grid container justify="space-between" alignItems="center" style={{ paddingTop: 32}}>
        {/* LEFT SIDE OF HEADER */}
        <Grid item>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Button onClick={toggleOpen} color="primary">
                { open
                    ? <MenuOpenIcon fontSize="large" />
                    : <MenuIcon fontSize="large"/>
                }
              </Button>
            </Grid>
            <Grid item>
              <Link href="/" passHref>
                <a>
                  <Image src={'/logo_light.png'} width={3685/imgReducer} height={676/imgReducer} title="Bitcrush logo" />
                </a>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        {/* RIGHT SIDE OF HEADER */}
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

export default HeaderBar

const useStyles = makeStyles( (theme: Theme) => createStyles({
  appBar:{
    zIndex: 1900,
    border: 'none'
  }
}))