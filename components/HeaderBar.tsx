import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useMemo, useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
// Material
import { makeStyles, createStyles, Theme, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'
// BitCrush
import TokenDisplay from 'components/TokenDisplay'
import GeneralButton from 'components/basics/GeneralUseButton'
import ProfileAvatar from 'components/ProfileAvatar'
import MenuIcon, { gradient, gradient2 } from 'components/svg/MenuIcon'
import Coin from 'components/tokens/Token2'
// Hooks
import { useAuthContext } from 'hooks/contextHooks'
import { shortAddress } from 'utils/text/text'
import { useTransactionContext } from 'hooks/contextHooks'
import usePrevLiveWallet from 'hooks/usePrevLw'
// libs
import { getContracts } from 'data/contracts'

const HeaderBar = ( props: {open: boolean, toggleOpen: () => void } ) => {
  const { open, toggleOpen } = props
  const [ svgGradient, gradientId] = gradient()
  const [ svgGradient2, gradientId2] = gradient2()
  const css = useStyles({ open, gradientId, gradientId2 })
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const { pathname } = useRouter()
  const { chainId, account } = useWeb3React()
  const { address: CrushAddress } = getContracts('crushToken', chainId)
  const isGame = pathname.indexOf('/games') > -1
  const isPlaying = pathname === '/games/[gameKey]'
  const imgReducer = isSm ? 26 : 18
  
  const { tokenInfo, liveWallet, toggleLwModal } = useTransactionContext()
  const { hasFunds, withdrawAll} = usePrevLiveWallet({ account, chainId })

  const lwActions = [
    {name:'Add/Remove', onClick: toggleLwModal },
    {name:'Withdraw v1', onClick: withdrawAll, highlight: hasFunds},
    // {name:'View on BSC', onClick: ()=>console.log('action 3')},
    // {name:'History', onClick: ()=>console.log('action 4')},
  ]

  const crushActions = [
    { name: 'Buy CRUSH', onClick: ()=> window.open(`https://app.apeswap.finance/swap?inputCurrency=ETH&outputCurrency=${CrushAddress}`, '_blank') },
    { name: 'Knight Farm', onClick: ()=> window.open(`https://app.knightswap.financial/farms`, '_blank')},
    { name: 'APE Farm', onClick: ()=> window.open(`https://apeswap.finance/farms`, '_blank')},
    { name: 'CROX Farm', onClick: ()=> window.open(`https://app.croxswap.com/dualfarms`,'_blank')},
    { name: 'BABY Farm', onClick: ()=> window.open(`https://home.babyswap.finance/farms`, '_blank')},
  ]

  return <AppBar className={css.appBar} variant="outlined" position={ isSm ? "sticky" : "absolute"}>
    <Toolbar>
      <Grid container justifyContent="space-between" alignItems="center" className={ css.toolbar }>
        {/* LEFT SIDE OF HEADER */}
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <Button onClick={toggleOpen} className={css.menuOpen}>
                {svgGradient}{svgGradient2}
                <MenuIcon fontSize={isSm ? "medium" : "large"} className={ css.gradient } />
              </Button>
            </Grid>
            <Divider orientation="vertical" flexItem className={css.menuLogoDivider} />
            <Grid item>
              <Link href="/" passHref>
                <a>
                  { isGame 
                    ? <Image src={'/logo_light.png'} width={3685/imgReducer} height={676/imgReducer} title="Bitcrush logo" alt="Bitcrush Arcade Logo" />
                    : <Image src={'/bitcrush_logo.png'} width={3895/imgReducer} height={656/imgReducer} title="Bitcrush logo" alt="Bitcrush Logo" />
                  }
                </a>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        {/* RIGHT SIDE OF HEADER */}
        <Grid item>
          <Grid container alignItems="center">
            {/* TOKEN DISPLAY DATA TO COME FROM SERVER && BLOCKCHAIN */}
            <Grid item className={ css.dropOnSm }> 
              <TokenDisplay amount={liveWallet.balance} icon={<Coin scale={0.25} token="LIVE" />} color="secondary" actions={lwActions} label={isPlaying ? "Game Play Mode" : undefined} />
            </Grid>
            <Grid item className={ css.dropOnSm } style={{marginRight: 8}}>
              <TokenDisplay amount={tokenInfo.weiBalance} icon={<Coin scale={0.25}/>} color="primary" actions={crushActions} />
            </Grid>
            <Grid item className={ css.dropOnSm } style={{marginRight: 8}}>
              <ConnectButton/>
            </Grid>
            <Grid item>
              <ProfileAvatar playing={isPlaying}/>
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
    zIndex: 1250,
    border: 'none',
    backgroundColor: 'transparent',
    [theme.breakpoints.down('sm')]:{
      backgroundColor: theme.palette.background.header
    }
  },
  menuLogoDivider:{
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]:{
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(1),
    }
  },
  gradient:{
    fill: props =>  `url(#${ props.open ? props.gradientId : props.gradientId2})`,
  },
  dropOnSm:{
    [theme.breakpoints.down('sm')]:{
      display:'none'
    }
  },
  toolbar:{
    paddingTop: theme.spacing(4),
    paddingBottom: 0,
    [theme.breakpoints.down('sm')]:{
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1),
    }
  },
}))

const ConnectButton = () => {
  const { login, account } = useAuthContext()

  const displayAccount = useMemo( () => shortAddress(account || ''),[account])
  
  return <GeneralButton disabled={!!account } onClick={login} solidDisabledText>
    {account 
      ? displayAccount
      : "Connect"
    }
  </GeneralButton>
}