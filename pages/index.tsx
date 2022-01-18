import { useMemo, useState, useEffect, useCallback } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Carousel from 'react-material-ui-carousel'
// Material
import { Theme, useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import useMediaQuery from "@mui/material/useMediaQuery"
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
// Bitcrush Components
import PageContainer from 'components/PageContainer'
import Card from 'components/basics/Card'
import Coin from 'components/tokens/Token2'
import Currency from 'components/basics/Currency'
import Button from 'components/basics/GeneralUseButton'
import HarvestCard from 'components/pools/HarvestCard'
import SummaryCard from 'components/lottery/SummaryCard'
// Hooks & Context
import useBank from 'hooks/bank'
import { useTransactionContext } from 'hooks/contextHooks'
// Icons
import InvaderIcon, { invaderGradient } from 'components/svg/InvaderIcon'
import InfoIcon from '@mui/icons-material/InfoOutlined';
// utils
import { currencyFormat } from 'utils/text/text'
import { useContract } from 'hooks/web3Hooks'
import highlightedAnnouncements, { width as imgWidth, height as imgHeight, mobileHeight, mobileWidth } from 'data/announcements'
import useCoin from 'hooks/useCoin'
import { getContracts } from 'data/contracts'
import { blacklistExplanation } from 'data/texts'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { Receipt } from 'types/PromiEvent'

export default function Home() {

  const theme = useTheme()
  const isSm = useMediaQuery( theme.breakpoints.down('md') )
  const router = useRouter()
  const { chainId, account } = useWeb3React()
  const { tokenInfo, editTransactions, liveWallet: lwContext, toggleLwModal } = useTransactionContext()
  const { bankInfo, userInfo } = useBank()
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
      const accountStake = account ? await methods.stakings(account).call() : {stakedAmount: 0}
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
    .on('transactionHash', (tx:string) => {
      console.log('hash', tx )
      editTransactions(tx,'pending', { description: 'Harvest All Pools' })
    })
    .on('receipt', ( rc:Receipt) => {
      console.log('receipt',rc)
      editTransactions(rc.transactionHash,'complete')
    })
    .on('error', (error:any, receipt:Receipt) => {
      console.log('error', error, receipt)
      receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error',{ errorData: error })
    })
  },[methods, router, staked, account, editTransactions])

  const v1Distributed = new BigNumber(1766900).times( new BigNumber(10).pow(18)).toNumber()

  const totalValueLocked = tvl + bankInfo.totalStaked
  const maxWin = (bankInfo.totalBankroll + bankInfo.totalStaked) * 0.01
  const totalDistributed = bankInfo.stakingDistributed + v1Distributed
  
  /**
   * @description This helps for announcemnts that have special effects internally.
   */
  const clickAnnouncement = useCallback((name: string) => {
    console.log('annoucement', name)
  },[])

  const announcements = useMemo( () => highlightedAnnouncements.map( (annoucement, aIndex) => {
    const { name, img, imgMobile, link, target, rel } = annoucement
    const externalLink = link.indexOf('/') !== 0

    const mainImg = <a key={`announcement-imgButton-${aIndex}`}
      href={externalLink ? link : undefined}
      target={externalLink ? target : undefined}
      rel={externalLink ? rel : undefined}
      onClick={ () => clickAnnouncement(name) }
    >
      <Image 
        src={ !isSm ? img : imgMobile || img}
        height={ isSm ? mobileHeight : imgHeight}
        width={ isSm ? mobileWidth : imgWidth}
        layout="responsive"
        alt={name}
      />
    </a>


    return link && !externalLink
      ? <Link passHref href={link} key={`announcement-link-button-${aIndex}`}>
          {mainImg}
        </Link>
      : mainImg
  }), [clickAnnouncement, isSm])

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
          <Container maxWidth={false}>
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
                      <Currency value={totalValueLocked} decimals={0} isWei/>
                    </Typography>
                    <Typography variant="body2" paragraph={isSm} color="textSecondary" component="div" align={"center"}>
                      USD&nbsp;
                      <Currency value={totalValueLocked*tokenInfo.crushUsdPrice} decimals={2} isWei/>
                    </Typography>
                  </Grid>
                  <Divider orientation="vertical" flexItem/>
                  <Grid item xs={12} md={'auto'}>
                    <Typography variant="caption" component="div" align="center" color="secondary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Max Win
                    </Typography>
                    <Typography variant="h4" component="div" align="center">
                      <Currency value={maxWin} decimals={2} isWei/>
                    </Typography>
                    <Typography variant="body2" paragraph={isSm} color="textSecondary" component="div" align="center">
                      USD&nbsp;
                      <Currency value={maxWin * tokenInfo.crushUsdPrice} decimals={2} isWei/>
                    </Typography>
                  </Grid>
                  <Divider orientation="vertical" flexItem/>
                  <Grid item xs={12} md={'auto'}>
                    <Typography variant="caption" component="div" align="center" color="secondary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      CRUSH Burned
                    </Typography>
                    <Typography variant="h4" component="div" align="center">
                      <Currency value={tokenInfo.burned} decimals={0}/>
                    </Typography>
                    <Typography variant="body2" paragraph={isSm} color="textSecondary" component="div" align="center">
                      USD&nbsp;
                      <Currency value={tokenInfo.burned * tokenInfo.crushUsdPrice} decimals={2} />
                    </Typography>
                  </Grid>
                  <Divider orientation="vertical" flexItem/>
                  <Grid item xs={12} md={'auto'}>
                    <Typography variant="caption" component="div" align={isSm ? "center" : "right"} color="primary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Total Value Shared
                    </Typography>
                    <Typography variant="h4" component="div" align={isSm ? "center" : "right"}>
                      <Currency value={totalDistributed} decimals={0} isWei/>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="div" align={isSm ? "center" : "right"}>
                      USD&nbsp;
                      <Currency value={totalDistributed * tokenInfo.crushUsdPrice} decimals={2} isWei/>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {/* Announcement Card */}
            <section style={{ marginTop: 24, width: '100%' }}>
              <Carousel>
                {announcements}
              </Carousel>
            </section>
            {/* Announcement Card */}
            <section style={{ marginTop: 24, width: '100%' }}>
              <SummaryCard buyHref="/lottery"/>
            </section>
            <Grid container justifyContent="space-around" style={{marginTop: 16}}>
              <Grid item md={5} style={{ paddingTop: 16, paddingBottom: 16}}>
                <HarvestCard title="Staking Pool" color="primary"
                  rewardInfo={{
                    title: "CRUSH in Wallet",
                    amount: <Currency value={tokenInfo.weiBalance} isWei decimals={4}/>,
                    subtitle: <>
                        $ {<Currency value={tokenInfo.weiBalance.times(tokenInfo.crushUsdPrice)} isWei decimals={2}/>}
                      </>,
                  }}
                  stakedInfo={{
                    title: "CRUSH Staked",
                    amount: <Currency value={userInfo.staked} isWei decimals={4}/>,
                    subtitle: `$ ${currencyFormat( userInfo.staked * tokenInfo.crushUsdPrice, { decimalsToShow: 2, isWei: true })}`,
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
                      amount: <Currency value={lwContext.balance} isWei decimals={4} />,
                      subtitle: <>
                          $ <Currency value={lwContext.balance.times(tokenInfo.crushUsdPrice)} decimals={2} isWei/>
                        </>,
                      currency: "CRUSH",
                    }}
                    rewardInfo={{
                      title: "Total HOUSE Profit Earned",
                      amount: <Currency value={userInfo.claimed} decimals={4}/>,
                      subtitle: <>
                          $ <Currency value={userInfo.claimed * tokenInfo.crushUsdPrice} decimals={2}/>
                        </>,
                      currency: "CRUSH",
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
                  {partners.map( partner => {
                    const graphics = <>
                      <Image src={theme.palette.mode == "dark" && partner.logoDark || partner.logo} height={partner.height/partner.factor} width={partner.width/partner.factor} alt={partner.name} title={partner.name}/>
                        <Tooltip arrow placement="bottom"
                          title={<Typography variant="body1">{partner.name}</Typography>}
                        >
                          <Typography align="center" variant="body2" noWrap component="div">
                            {partner.name}
                          </Typography>
                        </Tooltip>
                    </>
                    return <Grid item key={`partner-${partner.name}`} style={{ maxWidth: 272/4}}>
                      { partner.internal
                        ? <Link href={partner.href} passHref>
                            <a target="_self" className={css.link}>
                              {graphics}
                            </a>
                          </Link>
                        : <a href={partner.href} rel="noopener noreferrer" target="_blank" className={css.link}>
                            {graphics}
                          </a>
                      }
                    </Grid>
                  })}
                </Grid>
              </CardContent>
            </Card>
            
            <Button width={'100%'} style={{marginTop: 24, marginBottom:32}} color="secondary" onClick={lwContext.selfBlacklist}>
              Self BlackList&nbsp;
              <Tooltip arrow leaveDelay={1000} classes={{ tooltip: css.tooltip}} placement="top" enterTouchDelay={100} leaveTouchDelay={120000}
                title={<Typography style={{maxWidth: '100%', maxHeight: '70vh', overflowY: 'scroll', padding: 16, whiteSpace: 'pre-line'}} align="left">
                {blacklistExplanation}
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
    background: theme.palette.mode == "dark" 
      ? `radial-gradient( closest-side, ${theme.palette.common.black} 0%, rgba(0,0,0,0) 100%)`
      : `radial-gradient( closest-side,${theme.palette.common.white} 0%, rgba(255,255,255,0) 100%)`
  },
  announcementTitle:{
    marginTop: 16,
    [theme.breakpoints.down('sm')]:{
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
    name: 'KnightSwap',
    href: 'https://app.knightswap.financial/farms',
    width: 272,
    height: 272,
    logo: '/assets/thirdPartyLogos/partners/knightswap-dark.png',
    logoDark: '/assets/thirdPartyLogos/partners/knightswap-logo.png',
    factor: 4
  },
  {
    name: 'Beefy Finance',
    href: 'https://app.beefy.finance/#/bsc',
    width: 272,
    height: 272,
    logo: '/assets/thirdPartyLogos/partners/beefy.png',
    factor: 4
  },
  {
    name: 'Dragon Gaming',
    href: '/games',
    width: 272,
    height: 272,
    logo: '/assets/thirdPartyLogos/partners/dragon-logo.png',
    factor: 4,
    internal: true
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
  internal?: boolean,
}