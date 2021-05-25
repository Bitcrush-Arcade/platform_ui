import Link from 'next/link'
import Image from 'next/image'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'
// Icons
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
// BitCrush
import TokenDisplay from 'components/TokenDisplay'
import GeneralButton from 'components/basics/GeneralUseButton'
import ProfileAvatar from 'components/ProfileAvatar'
import MenuIcon, { gradient, gradient2 } from 'components/svg/MenuIcon'

const HeaderBar = ( props: {open: boolean, toggleOpen: () => void } ) => {
  const { open, toggleOpen } = props
  const [ svgGradient, gradientId] = gradient()
  const [ svgGradient2, gradientId2] = gradient2()
  const css = useStyles({ open, gradientId, gradientId2 })
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
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <Button onClick={toggleOpen} className={css.menuOpen}>
                {svgGradient}{svgGradient2}
                <MenuIcon fontSize="large" className={ css.gradient } />
              </Button>
            </Grid>
            <Divider orientation="vertical" flexItem className={css.menuLogoDivider} />
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
          <Grid container alignItems="center" spacing={2}>
            {/* TOKEN DISPLAY DATA TO COME FROM SERVER && BLOCKCHAIN */}
            <Grid item> 
              <TokenDisplay amount={0.00000448900000} icon={<AccountBalanceWalletIcon/>} color="secondary" actions={token1Actions} />
            </Grid>
            <Grid item>
              <TokenDisplay amount={1578.100015580000005946} icon={<AccountBalanceWalletIcon/>} color="primary" actions={token1Actions} />
            </Grid>
            <Grid item>
              <GeneralButton >
                Connect
              </GeneralButton>
            </Grid>
            <Grid item>
              <ProfileAvatar/>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
}

export default HeaderBar

const useStyles = makeStyles<Theme, { open: boolean, gradientId: string, gradientId2: string}>( (theme: Theme) => createStyles({
  appBar:{
    zIndex: 1900,
    border: 'none'
  },
  menuLogoDivider:{
    marginRight: theme.spacing(2)
  },
  gradient:{
    fill: props =>  `url(#${ props.open ? props.gradientId : props.gradientId2})`,
  }
}))