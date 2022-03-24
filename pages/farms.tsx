// Next
import Head from 'next/head';
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useState, useCallback, useEffect } from "react"
import find from 'lodash/find'
// Libs
import { getClient, imageBuilder } from 'utils/sanityConfig'

// COMPONENTS
import BigNumber from 'bignumber.js'
import PageContainer from 'components/PageContainer';
import StakeModal, { StakeModalProps, StakeOptionsType, SubmitFunction } from 'components/basics/StakeModal';

// Bitcrush UI
import FarmCard from 'tw/farms/FarmCard';


const Farms = (props: InferGetStaticPropsType<typeof getStaticProps>) =>
{
  const { activeFarms, inactiveFarms } = props
  console.log(props)

  const [ showActive, setShowActive ] = useState<boolean>(true)

  const [ openStake, setOpenStake ] = useState<boolean>(false)
  const [ stakeSelected, setStakeSelected ] = useState<{
    options: Array<StakeOptionsType>,
    submitFn: SubmitFunction,
    init?: number,
    coinInfo?: StakeModalProps[ 'coinInfo' ]
  }>({ options: [], submitFn: () => { } })

  const toggleActive = useCallback(() => setShowActive(p => !p), [ setShowActive ])

  useEffect(() =>
  {
    if (stakeSelected.options.length == 0) return;
    setTimeout(() => setOpenStake(true), 300)
  }, [ stakeSelected ])

  return <PageContainer>
    <Head>
      <title>BITCRUSH - Farms</title>
      <meta name="description" content="BITCRUSH Farms" />
    </Head>
    <h2 className="text-center text-4xl mt-4 whitespace-pre-line font-zeb md:text-6xl lg:mt-0">
      Stellar Farms
    </h2>

    <div className="flex justify-center mt-9">
      <div className="flex flex-wrap gap-x-6 gap-y-8 justify-center lg:justify-evenly max-w-[61rem]">
        {
          showActive && activeFarms.length > 0 && activeFarms.map((farm: any, activeIndex: number) =>
          {
            const { pid, mult, fee, isLP, token } = farm
            return (
              <FarmCard key={`active-farm-${activeIndex}`}
                color={farm.color}
                highlight={farm.highlight}
                poolAssets=
                {{
                  baseTokenName: farm.baseToken?.name,
                  baseTokenSymbol: farm.baseToken?.symbol,
                  baseTokenImage: farm.baseToken ? imageBuilder(farm.baseToken.tokenIcon.asset._ref).height(35).width(35).url() : null,

                  mainTokenName: farm.mainToken.name,
                  mainTokenSymbol: farm.mainToken.symbol,
                  mainTokenImage: imageBuilder(farm.mainToken.tokenIcon.asset._ref).height(50).width(50).url() ?? "",

                  swapName: farm.swapPartner.name,
                  swapLogo: imageBuilder(farm.swapPartner.logo.asset._ref).height(20).width(20).url() ?? "",
                  swapUrl: farm.swapPartner.url,
                  swapDexUrl: farm.swapPartner.dex,
                  swapPoolUrl: farm.swapPartner.lp,

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
            )
          })
        }

      </div>
    </div>
    <StakeModal
      open={openStake}
      onClose={() => setOpenStake(false)}
      options={stakeSelected.options}
      onSubmit={stakeSelected.submitFn}
      initAction={stakeSelected.init}
      coinInfo={stakeSelected.coinInfo}
    />
  </PageContainer>
}

export default Farms


import Web3 from 'web3'
// CONTRACT
import { getContracts } from 'data/contracts'
import { farmAssets } from 'queries/pools';

export const getStaticProps: GetStaticProps = async () =>
{
  const activeFarms: Array<any> = []
  const inactiveFarms: Array<any> = []
  let data: any;

  // CONNECT TO BLOCKCHAIN
  //MAINNET
  // const provider = 'https://bsc-dataseed1.defibit.io/'
  // TESTNET
  const provider = 'https://data-seed-prebsc-1-s1.binance.org:8545/'

  const web3 = new Web3(new Web3.providers.HttpProvider(provider))
  const setup = getContracts('galacticChef', 97)
  if (setup.abi) {
    const contract = await new web3.eth.Contract(setup.abi, setup.address)

    // GET POOL COUNT FROM CHEF

    const poolAmount = await contract.methods.poolCounter().call()

    // GET POOL DATA FROM CHEF (STATIC DATA)
    const farms: Array<any> = []
    for (let i = 1; i <= poolAmount; i++) {
      const poolData = await contract.methods.poolInfo(i).call()
      // if (!poolData.isLP)
      //   continue
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
    const farmsQuery = farmAssets(farmIds)
    data = await client.fetch(farmsQuery)

    data.map((farm: any) =>
    {
      const poolFarm = find(farms, o => o.pid == farm.pid)
      const parsedFarm = {
        ...poolFarm,
        ...farm
      }
      parsedFarm.mult > 0 ?
        activeFarms.push(parsedFarm)
        : inactiveFarms.push(parsedFarm)

    })

  }

  return {
    props: {
      activeFarms,
      inactiveFarms,
      assetData: data
    }
  }
}