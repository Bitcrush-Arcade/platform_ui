import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useMemo, useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useImmer } from 'use-immer'
import { AbiItem } from 'web3-utils'
// Material
import { Theme, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import useMediaQuery from '@mui/material/useMediaQuery'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
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
import { useTransactionContext } from 'hooks/contextHooks'
// libs
import { getContracts } from 'data/contracts'
import { liveWallets } from 'data/liveWallets'
import { pink } from '@mui/material/colors';
import { usePreviewSubscription, client } from 'utils/sanityConfig'
// Queries
import { liveWalletsQuery as walletsQuery } from 'queries/livewallets'
import LiveWalletSelectModal from './displays/LiveWalletSelectModal'
import BigNumber from 'bignumber.js'
// ABI
import LiveWallet from 'abi/BitcrushLiveWallet.json'
import Token from 'abi/CrushToken.json'

const HeaderBar = ( props: {open: boolean, toggleOpen: () => void } ) => {
  const { open, toggleOpen } = props
  const [ svgGradient, gradientId] = gradient()
  const [ svgGradient2, gradientId2] = gradient2()
  const css = useStyles({ open, gradientId, gradientId2 })
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const { pathname } = useRouter()
  const { chainId, account } = useWeb3React()
  const { address: CrushAddress } = getContracts('crushToken', chainId)
  const [ allWallets, setAllWallets ] = useImmer<Array<{status: boolean, walletIcon: any, walletContract: any, tokenName: any, symbolToken:string, balance?: string, walletBalance?: string}>>([])
  const [ walletSelected, setWalletSelected ] = useState(liveWallets.crush)
  const [ lwSelectModal, setLwSelectModal ] = useState<boolean>(false)

  const { tokenInfo, liveWallet, toggleLwModal, web3 } = useTransactionContext()


  const getWalletBalances = useCallback( async () => {
    if(!web3 || !account) return
    const balances: Array<{lwBalance: string, currentWallet: string}> = []
    for( let i = 0; i < allWallets.length; i++){
      const usedAddress = allWallets[i].walletContract && (chainId === allWallets[i].walletContract.mainChain &&  allWallets[i].walletContract.mainAddress || chainId === allWallets[i].walletContract.testChain && allWallets[i].walletContract.testAddress) || null
      const usedTokenAddress = chainId === allWallets[i].tokenName.tokenContract.mainChain &&  allWallets[i].tokenName.tokenContract.mainAddress || chainId === allWallets[i].tokenName.tokenContract.testChain && allWallets[i].tokenName.tokenContract.testAddress || null
      const item = { lwBalance:'0', currentWallet:'0' }
      if(usedAddress){
        const walletContract = await new web3.eth.Contract(LiveWallet.abi as AbiItem[], usedAddress)
        item.lwBalance = new BigNumber(await walletContract.methods.balanceOf(account).call()).div(10**18).toString()
      }
      else{
        item.lwBalance = 'N/A'
      }
      if(usedTokenAddress){
        const tokenContract = await new web3.eth.Contract(Token.abi as AbiItem[], usedTokenAddress)
        item.currentWallet = new BigNumber(await tokenContract.methods.balanceOf(account).call()).div(10**18).toString()
      }
      else
        item.currentWallet = '0'
      balances.push(item)
    }
    setAllWallets( draft => {
      for(let j = 0; j < draft.length; j++){
        draft[j].balance = balances[j].lwBalance
        draft[j].walletBalance = balances[j].currentWallet
      }
    })
  },[allWallets, setAllWallets, web3, chainId, account])

  useEffect( () => {
    if(!allWallets.length) return

    getWalletBalances()
  },[getWalletBalances, allWallets])

  const toggleSelectModal = useCallback( () => setLwSelectModal(p => !p),[setLwSelectModal])

  const isGame = pathname.indexOf('/games') > -1
  const isPlaying = pathname === '/games/[gameKey]'
  const imgReducer = isSm ? 26 : 18
  
  const lwActions = [
    {name:'Add/Remove', onClick: toggleLwModal },
    {name:'Change Wallet', onClick: toggleSelectModal },
  ]

  const getAllWallets = useCallback( async() => {
    const data = await client.fetch(walletsQuery)
    setAllWallets(data)
  },[client, walletsQuery, setAllWallets])

  useEffect( () => {
    getAllWallets()
  },[getAllWallets])


  const crushActions = [
    { name: 'Buy CRUSH', onClick: ()=> window.open(`https://app.apeswap.finance/swap?inputCurrency=ETH&outputCurrency=${CrushAddress}`, '_blank') },
    { name: 'Knight Farm', onClick: ()=> window.open(`https://app.knightswap.financial/farms`, '_blank')},
    { name: 'APE Farm', onClick: ()=> window.open(`https://apeswap.finance/farms`, '_blank')},
    { name: 'CROX Farm', onClick: ()=> window.open(`https://app.croxswap.com/dualfarms`,'_blank')},
    { name: 'BABY Farm', onClick: ()=> window.open(`https://home.babyswap.finance/farms`, '_blank')},
  ]

  return <>
    <AppBar className={css.appBar} variant="outlined" elevation={0} position={ isSm ? "sticky" : "absolute"}>
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
                {/* LIVE WALLET */}
                <TokenDisplay 
                  amount={liveWallet.balance}
                  icon={<Coin scale={0.25} token="LIVE" />}
                  color="secondary"
                  actions={lwActions}
                  token={ walletSelected }
                  label={ isPlaying 
                    ? 
                      <Typography variant="body2" align="center" component="div" style={{whiteSpace: 'pre-line'}}>
                        Game Mode{'\n'}
                        <Typography align="center" style={{fontFamily: 'Zebulon', letterSpacing: 1.2}} component="span" className={css.crushIt}>
                          CRUSH IT!
                        </Typography>
                      </Typography>
                    : undefined
                  }
                />
              </Grid>
              <Grid item className={ css.dropOnSm } style={{marginRight: 8}}>
                {/* CRUSH on Wallet */}
                <TokenDisplay
                  amount={tokenInfo.weiBalance}
                  icon={<Coin scale={0.25}/>}
                  color="primary"
                  actions={crushActions}
                />
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
    <LiveWalletSelectModal open={lwSelectModal} onClose={toggleSelectModal} wallets={allWallets}/>
  </>
}

export default HeaderBar

const useStyles = makeStyles<Theme, { open: boolean, gradientId: string, gradientId2: string}>( (theme: Theme) => createStyles({
  appBar:{
    border: 'none',
    backgroundColor: 'transparent',
    [theme.breakpoints.down('md')]:{
      backgroundColor: theme.palette.moreBg.header
    }
  },
  menuLogoDivider:{
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('md')]:{
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(1),
    }
  },
  gradient:{
    fill: props =>  `url(#${ props.open ? props.gradientId : props.gradientId2})`,
  },
  dropOnSm:{
    [theme.breakpoints.down('md')]:{
      display:'none'
    }
  },
  toolbar:{
    paddingTop: theme.spacing(4),
    paddingBottom: 0,
    [theme.breakpoints.down('md')]:{
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1),
    }
  },
  crushIt:{
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
    animationIterationCount:'infinite',
  },
  "@keyframes crushing":{
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

const ConnectButton = () => {
  const { login, account } = useAuthContext()

  const displayAccount = useMemo( () => shortAddress(account || ''),[account])
  
  return <GeneralButton disabled={!!account } onClick={login} solidDisabledText variant="extended">
    {account 
      ? displayAccount
      : "Connect"
    }
  </GeneralButton>
}