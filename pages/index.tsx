import { useMemo, useState, useEffect, useCallback } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useImmer } from 'use-immer'
// Material
import { makeStyles, createStyles, Theme, useTheme } from "@material-ui/core/styles"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import CardContent from '@material-ui/core/CardContent'
import Container from '@material-ui/core/Container'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
// Bitcrush Components
import PageContainer from 'components/PageContainer'
import Card from 'components/basics/Card'
import Coin from 'components/tokens/Token2'
import Button from 'components/basics/GeneralUseButton'
import HarvestCard from 'components/pools/HarvestCard'
// Hooks & Context
import useBank from 'hooks/bank'
import { useTransactionContext } from 'hooks/contextHooks'
// Icons
import InvaderIcon, { invaderGradient } from 'components/svg/InvaderIcon'
import InfoIcon from '@material-ui/icons/InfoOutlined';
// utils
import { currencyFormat } from 'utils/text/text'
import { useContract } from 'hooks/web3Hooks'
import useCoin from 'hooks/useCoin'
import { getContracts } from 'data/contracts'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'

export default function Home() {

  const theme = useTheme()
  const isSm = useMediaQuery( theme.breakpoints.down('sm') )
  const router = useRouter()
  const { chainId, account } = useWeb3React()
  const { tokenInfo, editTransactions, liveWallet: lwContext, toggleLwModal } = useTransactionContext()
  const { bankInfo } = useBank()
  const { approve, getApproved, isApproved } = useCoin()
  // Contracts
  const firstPool = useMemo( () => getContracts('singleAsset', chainId ), [chainId])
  const liveWallet = useMemo( () => getContracts('liveWallet', chainId), [chainId])
  const { methods } = useContract(firstPool.abi, firstPool.address)

  const [tvl, setTvl ] = useState<number>(0)
  const [staked, setStaked ] = useState<number>(0)

  // ICON GRADIENT
  const [ gradient, gradientId ] = invaderGradient()
  const css = useStyles({ gradientId })

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
      setTvl( new BigNumber(totalStaked).toNumber() )
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

  const v1Distributed = new BigNumber(1766900).times( new BigNumber(10).pow(18)).toNumber()

  const totalValueLocked = tvl + bankInfo.totalStaked
  const maxWin = (bankInfo.totalBankroll + bankInfo.totalStaked) * 0.01
  const totalDistributed = bankInfo.stakingDistruted + v1Distributed

  return (<>
  <Head>
    <title>BITCRUSH</title>
    <meta name="description" content="The first hybrid DEFI Casino on BSC"/>
    <meta name="author" content="Bitcrush"/>
  </Head>
      <PageContainer >
        <h1 style={{marginBottom: 16 , paddingTop: 32,}}>
            <Typography variant="h5" align="center" component="div" style={{ fontWeight: 200 }}>
              THE FIRST
            </Typography>
            <Typography variant="h3" align="center" component="div" style={{ fontWeight: 500 }}>
              HYBRID
            </Typography>
            <Typography variant="h2" align="center" component="div" style={{ fontWeight: 500, fontFamily: 'Zebulon', letterSpacing: 1.2 }}>
              GAMEFI
            </Typography>
            <Typography variant="h5" align="center" component="div" style={{ fontWeight: 200 }}>
              ON BSC
            </Typography>
        </h1>
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
                      }
                      color="primary" style={{ textTransform: 'uppercase', opacity: 0.9 }}
                    >
                      Total Value Locked
                    </Typography>
                    <Typography variant="h4" component="div" align={"center"}>
                      {currencyFormat( totalValueLocked ,{ decimalsToShow: 0, isWei: true})}
                    </Typography>
                    <Typography variant="body2" paragraph={isSm} color="textSecondary" component="div" align={"center"}>
                      USD&nbsp;{currencyFormat( totalValueLocked*tokenInfo.crushUsdPrice ,{ decimalsToShow: 2, isWei: true})}
                    </Typography>
                  </Grid>
                  <Divider orientation="vertical" flexItem/>
                  <Grid item xs={12} md={'auto'}>
                    <Typography variant="caption" component="div" align="center" color="secondary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Max Win
                    </Typography>
                    <Typography variant="h4" component="div" align="center">
                      {currencyFormat( maxWin ,{ decimalsToShow: 2, isWei: true })}
                    </Typography>
                    <Typography variant="body2" paragraph={isSm} color="textSecondary" component="div" align="center">
                      USD&nbsp;{currencyFormat( maxWin * tokenInfo.crushUsdPrice ,{ decimalsToShow: 2, isWei: true })}
                    </Typography>
                  </Grid>
                  <Divider orientation="vertical" flexItem/>
                  <Grid item xs={12} md={'auto'}>
                    <Typography variant="caption" component="div" align={isSm ? "center" : "right"} color="primary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Total Value Shared
                    </Typography>
                    <Typography variant="h4" component="div" align={isSm ? "center" : "right"}>
                      {currencyFormat(totalDistributed,{ decimalsToShow: 0, isWei: true })}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="div" align={isSm ? "center" : "right"}>
                      USD&nbsp;{currencyFormat( totalDistributed * tokenInfo.crushUsdPrice,{ decimalsToShow: 2, isWei: true })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {/* Announcement Card */}
            <section style={{ marginTop: 24, width: '100%' }}>
              <Image src={ isSm ? "/assets/announcements/mobile-yield.png" : "/assets/announcements/banner-yield.png"} height={ isSm ? 250 : 310} width={isSm ? 300 : 1080} layout="responsive" alt="Announcement Yiel Parrot partnership"/>
            </section>
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
                  action2Title="Staking 2.0"
                  action2Color="secondary"
                  btn2Props={{
                    href: '/mining'
                  }}
                />
              </Grid>
              <Grid item md={5} style={{ paddingTop: 16, paddingBottom: 8}}>
                <Grid container justifyContent="flex-end">
                  <HarvestCard title="Live Wallet" color="secondary"
                    stakedInfo={{
                      title: "LIVE Wallet Balance",
                      amount: new BigNumber(lwContext.balance).div( new BigNumber(10).pow(18) ).toNumber(),
                      subtitle: `$ ${currencyFormat( lwContext.balance * tokenInfo.crushUsdPrice, { decimalsToShow: 2, isWei: true } )}`,
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
                    action1Title={ isApproved ? "Add / Remove" : "Approve LiveWallet"}
                    action2Title="Buy CRUSH"
                    action2Color="primary"
                    btn1Props={{
                      onClick: () => isApproved ? toggleLwModal() : approve(liveWallet.address)
                    }}
                    btn2Props={{
                      href: "https://dex.apeswap.finance/#/swap"
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Card background="light" style={{ marginTop: 24}}>
              <CardContent>
                <Typography paragraph align="center" variant="h5" style={{marginTop: 8, textTransform: 'uppercase', fontWeight: 500}}>
                  Our Partners
                </Typography>
                <Grid container alignItems="center" justifyContent="space-evenly">
                  {partners.map( partner => <Grid item key={`partner-${partner.name}`} style={{ maxWidth: 272/4}}>
                      <a href={partner.href} rel="noopener noreferrer" target="_blank" className={css.link}>
                      <Image src={theme.palette.type == "dark" && partner.logoDark || partner.logo} height={partner.height/partner.factor} width={partner.width/partner.factor} alt={partner.name} title={partner.name}/>
                      <Tooltip arrow placement="bottom"
                        title={<Typography variant="body1">{partner.name}</Typography>}
                      >
                        <Typography align="center" variant="body2" noWrap component="div">
                          {partner.name}
                        </Typography>
                      </Tooltip>
                      </a>
                  </Grid>)}
                </Grid>
              </CardContent>
            </Card>
            
            <Button width={'100%'} style={{marginTop: 24, marginBottom:32}} color="secondary">
              Self BlackList&nbsp;
              <Tooltip arrow interactive leaveDelay={1000} classes={{ tooltip: css.tooltip}} placement="top" enterTouchDelay={100} leaveTouchDelay={120000}
                title={<Typography style={{maxWidth: '100%', maxHeight: 500, overflowY: 'scroll', padding: 16, whiteSpace: 'pre-line'}} align="left">
                Gambling should be for entertainment purposes and Bitsler is focused on offering you the best gaming experience. However, for a small number of people, gambling can cause problems. Bitsler is committed to support responsible gaming, so we would like to make you aware of the risks too.
                {'\n'}
                Test to see if you have a gambling problem{'\n'}
                It&apos;s important to know if gambling is causing you or others around you harm. Please have a look at the following questions:{'\n'}
                {'\n'}
                - Do you ever gamble more than you can afford to lose?{'\n'}
                - Do you find it hard to manage or stop your gambling?{'\n'}
                - Do you neglect work, studies, family, friends or personal needs because of gambling?{'\n'}
                - Does gambling make you feel worried, irritable or depressed?{'\n'}
                - Do you need to gamble with larger amounts of money to get the same level of excitement?{'\n'}
                {'\n'}
                If you have answered yes to any of these questions, you may have a gambling problem. We recommend looking at the following sites that can provide help and advice:
                {'\n'}{'\n'}

                Self-exclusion{'\n'}
                If you think gambling is causing problems, it might be best to exclude yourself from gambling. We can block your account for 6 hours, 24 hours, 3 days, 1 week, 2 weeks, 1 month, 3 months or 6 months on your request. Please contact our support for self-exclusion and our trained staff will help you.{'\n'}
                {'\n'}
                Underage gambling{'\n'}
                Bitsler only accepts players over 18 years of age. We make it perfectly clear in our Terms and Conditions that you must be over 18 years of age and require explicit consent at the registration. Underage players will have their accounts permanently blocked and their winnings forfeited.{'\n'}
                  {'\n'}
                If you are an adult player on Bitsler and there are any underage members in your household, please be responsible for protecting your computer and login details. You could also use internet filters to reduce the chance of underage gambling in your home like CyberPatrol and Net Nanny.{'\n'}
                {'\n'}
                Questions?{'\n'}
                For any other questions regarding responsible gaming please contact our support.{'\n'}
                </Typography>}
              >
                <InfoIcon/>
              </Tooltip>
            </Button>
          </Container>
      </PageContainer>
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
  link:{
    textDecoration: 'none',
    color: theme.palette.text.primary
  },
  tooltip:{
    width: '80vw',
    maxWidth: 900,
  },
}))

const partners: PartnerData[] = [
  {
    name: 'Apeswap',
    href: 'https://apeswap.finance/farms',
    width: 272,
    height: 272,
    logo: '/assets/thirdPartyLogos/partners/ape-logo.png',
    factor: 4
  },
  {
    name: 'Babyswap',
    href: 'https://home.babyswap.finance/farms',
    width: 272,
    height: 272,
    logo: '/assets/thirdPartyLogos/partners/baby-logo.png',
    factor: 4
  },
  {
    name: 'Wizard Financial',
    href: 'https://wizard.financial/',
    width: 272,
    height: 272,
    logo: '/assets/thirdPartyLogos/partners/wizard.png',
    factor: 4
  },
  {
    name: 'CroxSwap',
    href: 'https://app.croxswap.com/dualfarms',
    width: 272,
    height: 272,
    logo: '/assets/thirdPartyLogos/partners/crox-light.png',
    logoDark: '/assets/thirdPartyLogos/partners/crox-dark.png',
    factor: 4
  },

  {
    name: 'Revolver Token',
    href: 'https://www.revolvertoken.com/',
    width: 272,
    height: 272,
    logo: '/assets/thirdPartyLogos/partners/revolver-logo.png',
    factor: 4
  },

]

type PartnerData = {
  name: string,
  href: string, 
  width: number,
  height: number,
  logo: string,
  logoDark?: string,
  factor: number,
}