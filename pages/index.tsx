import { useMemo, useState, useEffect, useCallback } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useImmer } from 'use-immer'
import format from 'date-fns/format'
// Material
import { makeStyles, createStyles, Theme, useTheme } from "@material-ui/core/styles"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import CardContent from '@material-ui/core/CardContent'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// Bitcrush Components
import PageContainer from 'components/PageContainer'
import SmallBtn from 'components/basics/SmallButton'
import Card from 'components/basics/Card'
import Coin from 'components/tokens/Token2'
import HarvestCard from 'components/pools/HarvestCard'
import StakeModal, { StakeOptionsType, SubmitFunction } from "components/basics/StakeModal"
// Context
import { useTransactionContext } from 'hooks/contextHooks'
// Icons
import InvaderIcon, { invaderGradient } from 'components/svg/InvaderIcon'
// utils
import { currencyFormat } from 'utils/text/text'
import { useContract } from 'hooks/web3Hooks'
import useCoin from 'hooks/useCoin'
import { getContracts } from 'data/contracts'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { toWei } from 'web3-utils'

export default function Home() {

  const theme = useTheme()
  const isSm = useMediaQuery( theme.breakpoints.down('sm') )
  const router = useRouter()
  const { chainId, account } = useWeb3React()
  const { tokenInfo, editTransactions, hydrateToken } = useTransactionContext()
  const { approve, getApproved, isApproved } = useCoin()
  // Contracts
  const firstPool = useMemo( () => getContracts('singleAsset', chainId ), [chainId])
  // TODO ONCE LIVE remove conditional
  const liveWallet = useMemo( () => getContracts('liveWallet', chainId), [chainId])
  const { methods: liveWalletMethods } = useContract( liveWallet.abi, liveWallet.address )
  const { methods } = useContract(firstPool.abi, firstPool.address)

  const [tvl, setTvl ] = useState<number>(0)
  const [staked, setStaked ] = useState<number>(0)

  // LiveWalletFns
  const [currentBalance, setCurrentBalance] = useImmer<{ amount: number, timelock: number }>({ amount: 0, timelock: 0}) //IN WEI
  const [openLwModal, setOpenLwModal] = useState<boolean>(false)

  const timelockInPlace = new Date().getTime()/1000 < currentBalance.timelock
  console.log(timelockInPlace, new Date().getTime()/1000, currentBalance.timelock)

  // ICON GRADIENT
  const [ gradient, gradientId ] = invaderGradient()
  const css = useStyles({ gradientId })

  const lwSubmit: SubmitFunction = ( values, form ) => {
    if(!liveWalletMethods) return form.setSubmitting(false)
    console.log('form submit', values)
    const weiValue = toWei(`${new BigNumber(values.stakeAmount).toFixed(18,1)}`)
    if(!values.actionType){
      return liveWalletMethods.addbet( weiValue )
        .send({ from: account })
        .on('transactionHash', (tx) => {
          console.log('hash', tx )
          editTransactions(tx,'pending', { description: `Add Funds to Live Wallet`})
          setOpenLwModal(false)
        })
        .on('receipt', ( rc) => {
          console.log('receipt',rc)
          editTransactions(rc.transactionHash,'complete')
          getLiveWalletData()
          hydrateToken()
        })
        .on('error', (error, receipt) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
          getLiveWalletData()
        })
    }
    return liveWalletMethods.withdrawBet( weiValue )
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Withdraw Funds from LiveWallet`})
        setOpenLwModal(false)
      })
      .on('receipt', ( rc) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        getLiveWalletData()
        hydrateToken()
      })
      .on('error', (error, receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        getLiveWalletData()
      })
  }

  // LIVE WALLET Fns
  const getLiveWalletData = useCallback(async () => {
    if(!account) return
    const lwBalance = await liveWalletMethods.balanceOf( account ).call()
    const lwBetAmounts = await liveWalletMethods.betAmounts( account ).call()
    const lwDuration = await liveWalletMethods.lockPeriod().call()
    setCurrentBalance( draft => {
      draft.amount = new BigNumber(lwBalance).toNumber()
      draft.timelock = new BigNumber(lwBetAmounts.lockTimeStamp).plus(lwDuration).toNumber()
    })
  }, [liveWalletMethods, setCurrentBalance, account])

  const superWithdraw = useCallback(( amount: number ) => {
    if(!account || !liveWalletMethods || !amount ) return
    console.log('TODO CREATE API FOR SUPERWITHDRAW')
  },[liveWalletMethods, account])

  // LiveWallet Options
  const lwOptions: Array<StakeOptionsType> = [
    { 
      name: 'Add Funds',
      description: 'Add Funds to Live Wallet from CRUSH',
      btnText: 'Wallet CRUSH',
      maxValue: tokenInfo.weiBalance
    },
    { 
      name: 'Withdraw Funds',
      description: 'Withdraw funds from Live Wallet to CRUSH',
      btnText: 'Live Wallet CRUSH',
      maxValue: currentBalance.amount,
      onSelectOption: getLiveWalletData,
      more: function moreDetails ( values ) { 
        return timelockInPlace ? <>
        <Typography variant="caption" component="div" style={{ marginTop: 16, letterSpacing: 1.5}} align="justify" >
          Seems like you&apos;ve recently made some bets. Your funds are locked until we sync back up or until {format( new Date(currentBalance.timelock * 1000), 'yyyy MMM dd - h:mm a')}.
          <br/>
          <br/>
          If you&apos;d like to withdraw your funds anyway, a withdrawal fee of 3% is taken and please click here: <br/><br/>
          <SmallBtn onClick={() => superWithdraw(values.stakeAmount)} disabled>
            {/* Withdraw Now */}
            COMING SOON
          </SmallBtn>
        </Typography>
      </>
      : <></>
    }
    },
  ]


  useEffect( () => {
    if(!liveWalletMethods || !account) return
    getLiveWalletData()
  },[account, liveWalletMethods, getLiveWalletData])

  useEffect( () => {
    // FETCH DATA EVERY 12 SECONDS
    if(!liveWalletMethods || !account) return
    const interval = setInterval( () => getLiveWalletData(), 12000 )
    return () => clearInterval(interval)
  },[account, liveWalletMethods, getLiveWalletData])

  useEffect( () => {
    if(!liveWallet?.address) return
    getApproved(liveWallet.address)
  },[liveWallet, getApproved])
  // STAKED CRUSH
  useEffect( () => {
    if(!methods) return
    const getTvl = async () => {
      const totalStaked = await methods.totalStaked().call()
      const accountStake = await methods.stakings(account).call()
      setTvl( new BigNumber(totalStaked).div( new BigNumber(10).pow(18) ).toNumber() )
      setStaked( new BigNumber(accountStake?.stakedAmount || 0).div( new BigNumber(10).pow(18) ).toNumber() )
    }
    getTvl()
  },[ methods, setTvl, account ])

  const harvestAll = useCallback(()=>{
    if(!methods) return
    if( account && !staked)
      return router.push("/mining","/mining",{ shallow: false})
    methods.claim().send({ from: account })
    .on('transactionHash', (tx) => {
      console.log('hash', tx )
      editTransactions(tx,'pending', { description: 'Harvest All Pools' })
    })
    .on('receipt', ( rc) => {
      console.log('receipt',rc)
      editTransactions(rc.transactionHash,'complete')
    })
    .on('error', (error, receipt) => {
      console.log('error', error, receipt)
      receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error',{ errorData: error })
    })
  },[methods, router, staked, account, editTransactions])

  return (<>
  <Head>
    <title>BITCRUSH</title>
    <meta name="description" content="The first hybrid DEFI Casino on BSC"/>
    <meta name="author" content="Bitcrush"/>
  </Head>
      <PageContainer >
          <Typography variant="h2" align="center" component="h1" style={{ marginBottom: 16 , paddingTop: 32, fontWeight: 500, whiteSpace: 'pre-line' }}>
            <Typography variant="h5" component="p" style={{ fontWeight: 200 }}>
              THE FIRST
            </Typography>
            <Typography variant="h3" component="p" style={{ fontWeight: 500 }}>
              HYBRID
            </Typography>
            DEFI CASINO
            <Typography variant="h5" component="p" style={{ fontWeight: 200 }}>
              ON BSC
            </Typography>
          </Typography>
          <Grid container justifyContent="center">
              <Grid item className={css.gradientContainer}>
                {gradient}
                <InvaderIcon style={{fontSize: 120}} className={ css.gradient }/>
              </Grid>
          </Grid>
          {/* BITCRUSH TVL INFO */}
          <Container maxWidth="lg">
            {/* TVL Card */}
            <Card style={{ width: '100%'}} background="transparent" shadow="primary" opacity={0.7} >
              <CardContent style={{paddingBottom: 16}}>
                <Grid container justifyContent="space-around">
                  <Grid item xs={12} md={'auto'}>
                    <Typography variant="caption" component="div" 
                      align={"center"
                        //isSm ? "center" : "left"
                      }
                      color="primary" style={{ textTransform: 'uppercase', opacity: 0.9 }}
                    >
                      Total Value Locked
                    </Typography>
                    <Typography variant="h4" component="div" align={"center"}>
                      {currencyFormat(tvl,{ decimalsToShow: 0})}
                    </Typography>
                  </Grid>
                  {/* <Divider orientation="vertical" flexItem/> */}
                  <Grid item xs={12} md={'auto'}>
                    <Typography variant="caption" component="div" align="center" color="secondary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Max Win
                    </Typography>
                    <Typography variant="h4" component="div" align="center">
                      {/* {currencyFormat(maxWin,{ decimalsToShow: 0})} */}
                      COMING SOON
                    </Typography>
                  </Grid>
                  {/* <Divider orientation="vertical" flexItem/>
                  <Grid item xs={12} md={'auto'}>
                    <Typography variant="caption" component="div" align={isSm ? "center" : "right"} color="primary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Total Value Shared
                    </Typography>
                    <Typography variant="h4" component="div" align={isSm ? "center" : "right"}>
                      {currencyFormat(totalValueShared,{ decimalsToShow: 0})}
                    </Typography>
                  </Grid> */}
                </Grid>
              </CardContent>
            </Card>
            {/* Announcement Card */}
            <Card style={{marginTop: 24}}>
              <CardContent>
                <Typography variant="h4" align="center" className={ css.announcementTitle }>
                  Announcements
                </Typography>
                <Grid container justifyContent="space-evenly" alignItems="center">
                  <Grid item xs={12} md={5}>
                    <Image src={`/games/bountyBanner.png`} layout="responsive" width={1260/6} height={432/6} alt={`announcement banner for bitcrush bounty game`}/>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Grid container justifyContent="flex-end">
                      <Grid item xs={12}>
                        <Typography style={{ padding: 16, whiteSpace: 'pre-line'}} >
                          We&apos;re excited to announce our first live game in collaboration with Wizard Financial; “Bitcrush Bounty”!{'\n'}
                          Compete against other squad members to place the final bid and win the bounty.
                          Games happen several times daily so be sure to check in often and Crush It!
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Link href="/games" passHref>
                          <SmallBtn color="secondary" style={{ marginLeft: 'auto'}}>
                            GO PLAY!
                          </SmallBtn>
                        </Link>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Grid container justifyContent="space-around" style={{marginTop: 16}}>
              <Grid item md={5} style={{ paddingTop: 16, paddingBottom: 16}}>
                <HarvestCard title="Staking Pool" color="primary"
                  rewardInfo={{
                    title: "CRUSH in Wallet",
                    amount: tokenInfo.weiBalance/(10 ** 18),
                    subtitle: `$ ${currencyFormat(tokenInfo.crushUsdPrice * tokenInfo.weiBalance/(10 ** 18), { decimalsToShow: 2})}`,
                  }}
                  stakedInfo={{
                    title: "CRUSH Staked",
                    amount: staked,
                    subtitle: `$ ${currencyFormat( staked * tokenInfo.crushUsdPrice, { decimalsToShow: 2 })}`,
                  }}
                  action1Title={ !account && 'Connect First' || staked > 0 && "Harvest All" || "Go to Pool"}
                  icon={<Coin scale={0.5}/>}
                  firstAction={harvestAll}
                  btn1Props={{
                    disabled: !account,
                  }}
                />
              </Grid>
              <Grid item md={5} style={{ paddingTop: 16, paddingBottom: 8}}>
                <Grid container justifyContent="flex-end">
                  <HarvestCard title="Live Wallet" color="secondary"
                    stakedInfo={{
                      title: "LIVE Wallet Balance",
                      amount: new BigNumber(currentBalance.amount).div( new BigNumber(10).pow(18) ).toNumber(),
                      subtitle: `$ ${currencyFormat( currentBalance.amount * tokenInfo.crushUsdPrice, { decimalsToShow: 2, isWei: true } )}`,
                      currency: "CRUSH",
                    }}
                    rewardInfo={{
                      title: "HOUSE Profit Earned",
                      amount: 0,
                      subtitle: " --- ",
                      currency: "CRUSH",
                      comingSoon: true
                    }}
                    icon={<Coin token="LIVE" scale={0.5}/>}
                    action1Title={ isApproved ? "Fund Wallet" : "Approve LiveWallet"}
                    action2Title="Buy CRUSH"
                    action2Color="primary"
                    btn1Props={{
                      onClick: () => isApproved ? setOpenLwModal(true) : approve(liveWallet.address)
                    }}
                    btn2Props={{
                      href: "https://dex.apeswap.finance/#/swap"
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Container>
      </PageContainer>
      <StakeModal
        open={openLwModal}
        onClose={() => setOpenLwModal(false)}
        options={lwOptions}
        onSubmit={lwSubmit}
      />
  </>)
}

const useStyles = makeStyles<Theme, { gradientId: string }>( theme => createStyles({
  gradient: {
    fill: props => `url(#${ props.gradientId })`,
  },
  gradientContainer:{
    background: theme.palette.type == "dark" 
      ? `radial-gradient( closest-side, ${theme.palette.common.black} 0%, rgba(0,0,0,0) 100%)`
      : `radial-gradient( closest-side,${theme.palette.common.white} 0%, rgba(255,255,255,0) 100%)`
  },
  announcementTitle:{
    marginTop: 16,
    [theme.breakpoints.down('xs')]:{
      fontSize: theme.typography.h6.fontSize
    }
  },
}))