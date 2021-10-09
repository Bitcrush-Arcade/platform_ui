import { useMemo, useState, useEffect, useCallback } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
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
// Context
import { useTransactionContext } from 'hooks/contextHooks'
// Icons
import InvaderIcon, { invaderGradient } from 'components/svg/InvaderIcon'
// utils
import { currencyFormat } from 'utils/text/text'
import { useContract } from 'hooks/web3Hooks'
import { getContracts } from 'data/contracts'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'

export default function Home() {

  const theme = useTheme()
  const isSm = useMediaQuery( theme.breakpoints.down('sm') )
  const router = useRouter()
  const { chainId, account } = useWeb3React()
  const { tokenInfo, editTransactions } = useTransactionContext()
  const firstPool = useMemo( () => getContracts('singleAsset', chainId ), [chainId])
  const { methods } = useContract(firstPool.abi, firstPool.address)

  const [tvl, setTvl ] = useState<number>(0)
  const [staked, setStaked ] = useState<number>(0)

  const [ gradient, gradientId ] = invaderGradient()
  const css = useStyles({ gradientId })

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
            {/* <Card style={{marginTop: 24}}>
              <CardContent>
                <Typography variant="h4" align="center" className={ css.announcementTitle }>
                  Announcements
                </Typography>
                <Image src={ isSm ? "/assets/announcements/parrot_partner_mobile.png" : "/assets/announcements/parrot_partner.png"} height={ isSm ? 250 : 720/4} width={isSm ? 300 : 1280/4} layout="responsive"/>
              </CardContent>
            </Card> */}
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
                      amount: 0,
                      subtitle: " --- ",
                      currency: "CRUSH",
                      comingSoon: true
                    }}
                    rewardInfo={{
                      title: "HOUSE Profit Earned",
                      amount: 0,
                      subtitle: " --- ",
                      currency: "CRUSH",
                      comingSoon: true
                    }}
                    action1Title="Stake Now"
                    action2Title="Buy Now"
                    action2Color="primary"
                    btn1Props={{
                      href: "/mining"
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