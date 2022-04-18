import { useMemo, useState, useEffect } from 'react'
// Next
import Head from 'next/head'
// Material
import { Theme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
// Bitcrush
import CompoundingCardv2 from 'components/pools/CompoundingCardv2'
import CompoundingCardv3 from 'tw/mining/CompoundingCardv3'
import PageContainer from 'components/PageContainer'
import PoolCard from 'components/pools/PoolCard'
import PoolCardv2 from 'components/pools/PoolCardv2'
import BankPool from 'components/pools/BankPool'
import NicePoolCard from 'tw/mining/NicePoolCard'
import StakeModal, { StakeModalProps, StakeOptionsType, SubmitFunction } from 'components/basics/StakeModal';
import { getClient, imageBuilder } from 'utils/sanityConfig'

// libs
import { getContracts } from "data/contracts"
import { useWeb3React } from "@web3-react/core"

const Mining = (props: { activePools: Array<any>, inactivePools: Array<any>, activeFarmPool: Array<any>, inactiveFarmPool: Array<any> }) =>
{
  const { activePools, inactivePools, activeFarmPool, inactiveFarmPool } = props
  const css = useStyles({})
  const { chainId } = useWeb3React()

  const [ openStake, setOpenStake ] = useState<boolean>(false)
  const [ showInactive, setShowInactive ] = useState<boolean>(false)
  const toggleInactive = () => setShowInactive(p => !p)

  const firstPool = useMemo(() => getContracts('singleAsset', chainId), [ chainId ])
  const prevPool = useMemo(() => getContracts('prevStaking2', chainId), [ chainId ])
  const token = useMemo(() => getContracts('crushToken', chainId), [ chainId ])

  // Pool Cards
  const [ stakeSelected, setStakeSelected ] = useState<{
    options: Array<StakeOptionsType>,
    submitFn: SubmitFunction,
    init?: number,
    coinInfo?: StakeModalProps[ 'coinInfo' ]
  }>({ options: [], submitFn: () => { } })

  useEffect(() =>
  {
    if (stakeSelected.options.length == 0) return;
    setTimeout(() => setOpenStake(true), 300)
  }, [ stakeSelected ])

  return <PageContainer background="galactic">
    <Head>
      <title>BITCRUSH - MINING</title>
      <meta name="description" content="Mine CRUSH to your heart's content. Keep a look for more Pools to stake on soon" />
    </Head>
    <Grid container justifyContent="space-evenly"
      sx={theme => ({
        mt: 0,
        [ theme.breakpoints.down('md') ]: {
          mt: theme.spacing(4)
        }
      })}
    >
      <Grid item xs={10} sm={8} md={6} >
        <Descriptor
          title="Galactic Mining"
          description={`Stake CRUSH to earn APY as well as a share of the House Profit Distribution.
          Staking not only helps stabilize the CRUSH Economy, it also provides Bankroll for the games to scale.
          Due to the nature of gambling, this is riskier, but result in higher rewards than traditional staking. Please read through the information card or ask the community if you have any questions.
          
          You can help the community by calling the auto Compound function and earning a bounty % of the entire pending reward amount.
          All you need to do it press the Claim button, and watch the rewards compound for everyone staked in the pool.`}
        />
      </Grid>
      <Grid item sx={{ pt: { xs: 4, md: 0 } }}>
        <CompoundingCardv3 />
        {/* <CompoundingCardv2 /> */}
      </Grid>
      <Grid item xs={12} sx={{ pt: 4 }}>
        <BankPool />
      </Grid>
    </Grid>
    <Grid container justifyContent="space-evenly" className={css.section}>
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="More Pools"
          description={`Stake CRUSH coins in our single asset staking pool to earn APY.
          No risk pools`}
        />
      </Grid>
      <Grid item style={{ width: 215 }} />
    </Grid>
    <div className="flex flex-wrap gap-x-6 gap-y-8 my-[4rem] justify-center lg:justify-evenly max-w-[61rem] xl:ml-[5.5rem] 2xl:ml-[20rem]">
      {
        activeFarmPool.map((farm, farmIndex) =>
        {
          const { pid, mult, fee, isLP, token } = farm
          const baseImage = farm.baseToken ? imageBuilder(farm.baseToken.tokenIcon.asset._ref).height(35).width(35).url() : ""
          const mainImage = imageBuilder(farm.mainToken.tokenIcon.asset._ref).height(50).width(50).url() ?? ""
          const swapImage = farm.swapPartner ? imageBuilder(farm.swapPartner.logo.asset._ref).height(20).width(20).url() ?? "" : ""
          return (
            <div key={`active-nice-reward-pool-${farmIndex}`}>
              <FarmCard
                color={farm.color}
                highlight={farm.highlight}
                closeModal={() => setOpenStake(false)}
                poolAssets=
                {{
                  baseTokenName: farm.baseToken?.name,
                  baseTokenSymbol: farm.baseToken?.symbol,
                  baseTokenImage: baseImage,

                  mainTokenName: farm.mainToken.name,
                  mainTokenSymbol: farm.mainToken.symbol,
                  mainTokenImage: mainImage,

                  swapName: farm.swapPartner?.name,
                  swapLogo: swapImage,
                  swapUrl: farm.swapPartner?.url,
                  swapDexUrl: farm.swapPartner?.dex,
                  swapPoolUrl: farm.swapPartner?.lp,

                  pid,
                  mult,
                  isLP,
                  depositFee: fee || 0,
                  tokenAddress: token
                }}

                onAction={(options, fn, initAction, coinInfo) => setStakeSelected({
                  options: options,
                  submitFn: fn,
                  init: initAction,
                  coinInfo: coinInfo
                })}
              />
            </div>
          )
        })
      }
      {
        activePools.map((pool, poolIndex) =>
        {
          return (
            <div key={`partner-pool-active-${poolIndex}`}>
              <NicePoolCard
                color={true}
                highlight={true}
                tags={pool.tags}
                poolAssets={{
                  poolContractAddress: pool.poolContract,

                  rewardTokenName: pool.rewardToken.name,
                  rewardTokenSymbol: pool.rewardToken.symbol,
                  rewardTokenImage: imageBuilder(pool.rewardToken.tokenIcon.asset._ref).height(50).width(50).url() || '',
                  rewardTokenContract: pool.rewardToken.tokenContract,

                  stakeTokenName: pool.stakeToken.name,
                  stakeTokenSymbol: pool.stakeToken.symbol,
                  stakeTokenImage: imageBuilder(pool.stakeToken.tokenIcon.asset._ref).height(50).width(50).url() || '',
                  stakeTokenContract: pool.stakeToken.tokenContract,

                  projectName: "partner name",
                  projectLogo: "partner logo url",
                  projectUrl: "partner url",

                }}
                onAction={(options, fn, initAction, coinInfo) => setStakeSelected({
                  options: options,
                  submitFn: fn,
                  init: initAction,
                  coinInfo: coinInfo
                })}
              />
            </div>
          )
        })
      }
    </div>
    <StakeModal
      open={openStake}
      onClose={() => setOpenStake(false)}
      options={stakeSelected.options}
      onSubmit={stakeSelected.submitFn}
      initAction={stakeSelected.init}
      coinInfo={stakeSelected.coinInfo}
    />
    <Grid container justifyContent="space-evenly" className={css.section}>
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="Inactive Pools"
          description={<>
            {`Empty pools, nothing to do except withdraw.\n`}
            Hide <Switch value={showInactive} onClick={toggleInactive} /> Show
          </>}
        />
      </Grid>
      <Grid item style={{ width: 215 }} />
    </Grid>
    <div className={`flex flex-wrap gap-x-6 gap-y-8 my-[4rem] justify-center lg:justify-evenly max-w-[61rem] xl:ml-[3.5rem] 2xl:ml-[19rem] ${showInactive ? "" : "hidden"}`}>
      {
        inactiveFarmPool.map((farm, farmIndex) =>
        {
          const { pid, mult, fee, isLP, token } = farm
          const baseImage = farm.baseToken ? imageBuilder(farm.baseToken.tokenIcon.asset._ref).height(35).width(35).url() : ""
          const mainImage = imageBuilder(farm.mainToken.tokenIcon.asset._ref).height(50).width(50).url() ?? ""
          const swapImage = farm.swapPartner ? imageBuilder(farm.swapPartner.logo.asset._ref).height(20).width(20).url() ?? "" : ""
          return (
            <div key={`active-nice-reward-pool-${farmIndex}`}>
              <FarmCard
                color={farm.color}
                highlight={farm.highlight}
                poolAssets=
                {{
                  baseTokenName: farm.baseToken?.name,
                  baseTokenSymbol: farm.baseToken?.symbol,
                  baseTokenImage: baseImage,

                  mainTokenName: farm.mainToken.name,
                  mainTokenSymbol: farm.mainToken.symbol,
                  mainTokenImage: mainImage,

                  swapName: farm.swapPartner?.name,
                  swapLogo: swapImage,
                  swapUrl: farm.swapPartner?.url,
                  swapDexUrl: farm.swapPartner?.dex,
                  swapPoolUrl: farm.swapPartner?.lp,

                  pid,
                  mult,
                  isLP,
                  depositFee: fee || 0,
                  tokenAddress: token
                }}

                onAction={(options, fn, initAction, coinInfo) => setStakeSelected({
                  options: options,
                  submitFn: fn,
                  init: initAction,
                  coinInfo: coinInfo
                })}
              />
            </div>
          )
        })
      }
      {
        inactivePools.map((pool, poolIndex) =>
        {
          return (
            <div key={`partner-pool-active-${poolIndex}`}>
              <NicePoolCard
                color={true}
                highlight={true}
                tags={pool.tags}
                poolAssets={{
                  poolContractAddress: pool.poolContract,

                  rewardTokenName: pool.rewardToken.name,
                  rewardTokenSymbol: pool.rewardToken.symbol,
                  rewardTokenImage: imageBuilder(pool.rewardToken.tokenIcon.asset._ref).height(50).width(50).url() || '',
                  rewardTokenContract: pool.rewardToken.tokenContract,

                  stakeTokenName: pool.stakeToken.name,
                  stakeTokenSymbol: pool.stakeToken.symbol,
                  stakeTokenImage: imageBuilder(pool.stakeToken.tokenIcon.asset._ref).height(50).width(50).url() || '',
                  stakeTokenContract: pool.stakeToken.tokenContract,

                  projectName: "partner name",
                  projectLogo: "partner logo url",
                  projectUrl: "partner url",

                }}
                onAction={(options, fn, initAction, coinInfo) => setStakeSelected({
                  options: options,
                  submitFn: fn,
                  init: initAction,
                  coinInfo: coinInfo
                })}
              />
            </div>
          )
        })
      }
      <PoolCard disabled abi={firstPool.abi} contractAddress={firstPool.address} tokenAbi={token.abi} tokenAddress={token.address} infoText="No fees! - Crush It!" />
      <Grid item>
        <PoolCardv2
          abi={prevPool.abi}
          address={prevPool.address}
          name="Expiring SAS Pool"
          subtext="Simple Reward APR Pool"
        />
      </Grid>
    </div>
  </PageContainer>
}

export default Mining

const useStyles = makeStyles<Theme, {}>((theme) => createStyles({

  section: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },

}))

const useDescriptorStyles = makeStyles<Theme, {}>((theme) => createStyles({
  textContainer: {
    borderLeftColor: theme.palette.primary.main,
    borderLeftStyle: 'solid',
    borderLeftWidth: theme.spacing(0.5),
    paddingLeft: theme.spacing(3)
  },
  paragraph: {
    whiteSpace: 'pre-line',
    lineHeight: '150%'
  },
}))

const Descriptor = (props: { title: string, description: React.ReactNode }) =>
{
  const css = useDescriptorStyles({})
  return <div className={css.textContainer}>
    <Typography variant="h4" component="h1" paragraph>
      {props.title}
    </Typography>
    <Typography variant="body2" className={css.paragraph}>
      {props.description}
    </Typography>
  </div>
}

import { GetStaticProps, InferGetServerSidePropsType } from 'next'
import { pools, nicePools } from 'queries/pools'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import find from 'lodash/find'
import FarmCard from 'tw/farms/FarmCard';
export const getStaticProps: GetStaticProps = async () =>
{
  let activePools: Array<any> = [];
  let inActivePools: Array<any> = [];
  let nicePoolData: Array<any> = [];

  // CONNECT TO BLOCKCHAIN
  //MAINNETy
  const provider = 'https://bsc-dataseed1.defibit.io/'
  // TESTNET
  // const provider = 'https://data-seed-prebsc-1-s1.binance.org:8545/'

  const web3 = new Web3(new Web3.providers.HttpProvider(provider))
  const setup = getContracts('galacticChef', 56)
  if (setup.abi) {
    const contract = await new web3.eth.Contract(setup.abi, setup.address)

    // GET POOL COUNT FROM CHEF

    const poolAmount = await contract.methods.poolCounter().call()

    // GET POOL DATA FROM CHEF (STATIC DATA)
    const farms: Array<any> = []
    for (let i = 1; i <= poolAmount; i++) {
      const poolData = await contract.methods.poolInfo(i).call()
      if (poolData.isLP || poolData.type)
        continue;
      const parsedData = {
        fee: new BigNumber(poolData.fee).div(100).toNumber(), // DIVISOR IS 10000 so dividing by 100 gives us the % value
        mult: new BigNumber(poolData.mult).div(10000).toNumber(),
        isLP: Boolean(poolData.isLP),
        pid: i,
        token: String(poolData.token)
      }
      farms.push(parsedData)
    }
    const farmIds = farms.map(farm => farm.pid)
    console.log(farmIds)
    // GET ASSETS FROM SANITY
    const client = getClient(false)
    const farmsQuery = nicePools(farmIds)
    nicePoolData = await client.fetch(farmsQuery)

    nicePoolData.map((farm: any) =>
    {
      const poolFarm = find(farms, o => o.pid == farm.pid)
      const parsedFarm = {
        ...poolFarm,
        ...farm
      }
      parsedFarm.mult > 0 ?
        activePools.push(parsedFarm)
        : inActivePools.push(parsedFarm)

    })

  }

  let poolData: Array<any>;
  // GET ASSETS FROM SANITY
  const client = getClient(false)
  // nicePoolData = await client.fetch()
  poolData = await client.fetch(pools)

  return {
    props: {
      activeFarmPool: activePools,
      inactiveFarmPool: inActivePools,
      activePools: poolData.filter((d: any) => d.active),
      inactivePools: poolData.filter((d: any) => !d.active)
    }
  }
}