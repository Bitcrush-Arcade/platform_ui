import Link from 'next/link'
import Image from 'next/image'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'
// Icons
import MenuIcon from '@material-ui/icons/Menu'
import MenuOpenIcon from '@material-ui/icons/MenuOpen'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
// BitCrush
import TokenDisplay from 'components/TokenDisplay'
import GeneralButton from 'components/GeneralUseButton'

const HeaderBar = ( props: {open: boolean, toggleOpen: () => void } ) => {
  const css = useStyles({})
  const { open, toggleOpen } = props

  const imgReducer = 18

  const token1Actions = [
    {name:'Action1', onClick: ()=>console.log('action 1')},
    {name:'Action2', onClick: ()=>console.log('action 2')},
    {name:'Action3', onClick: ()=>console.log('action 3')},
    {name:'Action4', onClick: ()=>console.log('action 4')},
  ]

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
          <Grid container alignItems="center" spacing={1}>
            {/* TOKEN DISPLAY DATA TO COME FROM SERVER && BLOCKCHAIN */}
            <Grid item> 
              <TokenDisplay amount={33554} icon={<AccountBalanceWalletIcon/>} color="secondary" actions={token1Actions} />
            </Grid>
            <Grid item>
              <TokenDisplay amount={15785946} icon={<AccountBalanceWalletIcon/>} color="primary" actions={token1Actions} />
            </Grid>
            <Grid item>
              <GeneralButton color="secondary" >
                Connect
              </GeneralButton>
            </Grid>
            <Grid item>
          PROFILE (?)
            </Grid>
          </Grid>
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