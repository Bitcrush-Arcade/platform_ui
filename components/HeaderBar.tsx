import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useMemo, useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
// Material
import { Theme, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import useMediaQuery from '@mui/material/useMediaQuery'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
// BitCrush
import TokenDisplay from 'components/TokenDisplay'
import GeneralButton from 'components/basics/GeneralUseButton'
import ProfileAvatar from 'components/ProfileAvatar'
import MenuIcon, { gradient, gradient2 } from 'components/svg/MenuIcon'
import Coin from 'components/tokens/Token2'
// Hooks
import { useAuthContext } from 'hooks/contextHooks'
import { shortAddress } from 'utils/text/text'
import { useTransactionContext, useLiveWalletContext } from 'hooks/contextHooks'
// libs
import { imageBuilder } from 'utils/sanityConfig'
import { getContracts } from 'data/contracts'
import { pink } from '@mui/material/colors';
// Queries
import BigNumber from 'bignumber.js'

const HeaderBar = (props: { open: boolean, toggleOpen: () => void }) =>
{
  const { open, toggleOpen } = props
  const [ svgGradient, gradientId ] = gradient()
  const [ svgGradient2, gradientId2 ] = gradient2()
  const css = useStyles({ open, gradientId, gradientId2 })
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const { pathname } = useRouter()
  const { chainId, account } = useWeb3React()
  const { address: CrushAddress } = getContracts('crushToken', chainId)

  const [ openBanner, setOpenBanner ] = useState<boolean>(true)

  const { tokenInfo } = useTransactionContext()
  const { toggleSelectModal, selectedWallet, toggleStakeModal } = useLiveWalletContext()

  const isGame = pathname.indexOf('/games') > -1
  const isPlaying = pathname === '/games/[gameKey]'
  const imgReducer = isSm ? 26 : 18

  const lwActions = [
    { name: 'Add/Remove', onClick: toggleStakeModal },
    { name: 'Change Wallet', onClick: toggleSelectModal },
  ]

  const crushActions = [
    { name: 'Buy CRUSH', onClick: () => window.open(`https://app.apeswap.finance/swap?inputCurrency=ETH&outputCurrency=${CrushAddress}`, '_blank') },
    { name: 'Knight Farm', onClick: () => window.open(`https://app.knightswap.financial/farms`, '_blank') },
    { name: 'APE Farm', onClick: () => window.open(`https://apeswap.finance/farms`, '_blank') },
    { name: 'CROX Farm', onClick: () => window.open(`https://app.croxswap.com/dualfarms`, '_blank') },
    { name: 'BABY Farm', onClick: () => window.open(`https://home.babyswap.finance/farms`, '_blank') },
  ]

  useEffect(() =>
  {
    setTimeout(() =>
    {
      setOpenBanner(false)
    }, 15000)
  }, [ setOpenBanner ])

  return <>
    <Drawer
      anchor="top"
      variant='persistent'
      open={openBanner}
    >
      <Typography align="center" sx={{ py: 1 }}>
        <>
          There is only one CRUSH Token, please check that the address is&nbsp;
          <a href="https://bscscan.com/token/0x0ef0626736c2d484a792508e99949736d0af807e" style={{ color: '#1de9b6' }}>
            0x0ef0626736c2d484a792508e99949736d0af807e
          </a>
        </>
      </Typography>
    </Drawer>
    <AppBar className={css.appBar} variant="outlined" elevation={0} position={isSm ? "sticky" : "absolute"}>
      <Toolbar>
        <Grid container justifyContent="space-between" alignItems="center" className={css.toolbar}>
          {/* LEFT SIDE OF HEADER */}
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <Button onClick={toggleOpen} className={css.menuOpen}>
                  {svgGradient}{svgGradient2}
                  <MenuIcon fontSize={isSm ? "medium" : "large"} className={css.gradient} />
                </Button>
              </Grid>
              <Divider orientation="vertical" flexItem className={css.menuLogoDivider} />
              <Grid item>
                <Link href="/" passHref>
                  <a>
                    {isGame
                      ? <Image src={'/logo_light.png'} width={3685 / imgReducer} height={676 / imgReducer} title="Bitcrush logo" alt="Bitcrush Arcade Logo" />
                      : <Image src={'/bitcrush_logo.png'} width={3895 / imgReducer} height={656 / imgReducer} title="Bitcrush logo" alt="Bitcrush Logo" />
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
              <Grid item className={css.dropOnSm}>
                {/* LIVE WALLET */}
                <TokenDisplay
                  tokenIcon={selectedWallet?.walletIcon?.asset?._ref && imageBuilder(selectedWallet?.walletIcon?.asset?._ref).height(50).width(50).url() || undefined}
                  amount={new BigNumber(selectedWallet?.balance || '0').times(10 ** 18)}
                  icon={<Coin scale={0.25} token="LIVE" />}
                  color="secondary"
                  actions={lwActions}
                  label={isPlaying
                    ?
                    <Typography variant="body2" align="center" component="div" style={{ whiteSpace: 'pre-line' }}>
                      Game Mode{'\n'}
                      <Typography align="center" style={{ fontFamily: 'Zebulon', letterSpacing: 1.2 }} component="span" className={css.crushIt}>
                        CRUSH IT!
                      </Typography>
                    </Typography>
                    : undefined
                  }
                />
              </Grid>
              <Grid item className={css.dropOnSm} style={{ marginRight: 8 }}>
                {/* CRUSH on Wallet */}
                <TokenDisplay
                  amount={tokenInfo.weiBalance}
                  icon={<Coin scale={0.25} />}
                  color="primary"
                  actions={crushActions}
                />
              </Grid>
              <Grid item className={css.dropOnSm} style={{ marginRight: 8 }}>
                <ConnectButton />
              </Grid>
              <Grid item>
                <ProfileAvatar playing={isPlaying} currentLiveWallet={selectedWallet} changeLiveWallet={toggleSelectModal} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  </>
}

export default HeaderBar

const useStyles = makeStyles<Theme, { open: boolean, gradientId: string, gradientId2: string }>((theme: Theme) => createStyles({
  appBar: {
    border: 'none',
    backgroundColor: 'transparent',
    [ theme.breakpoints.down('md') ]: {
      backgroundColor: theme.palette.moreBg.header
    }
  },
  menuLogoDivider: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    [ theme.breakpoints.down('md') ]: {
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(1),
    }
  },
  gradient: {
    fill: props => `url(#${props.open ? props.gradientId : props.gradientId2})`,
  },
  dropOnSm: {
    [ theme.breakpoints.down('md') ]: {
      display: 'none'
    }
  },
  toolbar: {
    paddingTop: theme.spacing(4),
    paddingBottom: 0,
    [ theme.breakpoints.down('md') ]: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1),
    }
  },
  crushIt: {
    color: 'transparent',
    backgroundImage: `repeating-linear-gradient(to right,
      ${theme.palette.primary.light} 0%,
      ${theme.palette.primary.light} 10%,
      ${theme.palette.primary.light} 50%,
      ${pink.A200} 65%,
      ${pink.A200} 75%,
      ${theme.palette.primary.light} 90%,
      ${theme.palette.primary.light} 100%
    )`,
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animationName: '$crushing',
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  "@keyframes crushing": {
    "0%": {
      backgroundPosition: "0% 0%"
    },
    "100%": {
      backgroundPosition: "160% 0%"
    },
    // "100%": { 
    //   backgroundPosition: "0% 0%"
    // },
  }
}))

const ConnectButton = () =>
{
  const { login, account } = useAuthContext()

  const displayAccount = useMemo(() => shortAddress(account || ''), [ account ])

  return <GeneralButton disabled={!!account} onClick={login} solidDisabledText variant="extended">
    {account
      ? displayAccount
      : "Connect"
    }
  </GeneralButton>
}