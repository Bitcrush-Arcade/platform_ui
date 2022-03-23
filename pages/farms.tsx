// Next
import Head from 'next/head';
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useState, useCallback } from "react"
// COMPONENTS
import BigNumber from 'bignumber.js'
import PageContainer from 'components/PageContainer';


// Bitcrush UI
import FarmCard from 'tw/farms/FarmCard';


const Farms = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { activeFarms, inactiveFarms } = props
  console.log(props)

  const [showActive, setShowActive] = useState<boolean>(true)

  const toggleActive = useCallback(() => setShowActive(p => !p), [setShowActive])

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
          showActive && activeFarms.length > 0 && activeFarms.map((farm: string, activeIndex: number) => {
            const { pid, mult, fee, isLP, token } = JSON.parse(farm)
            return (
              <FarmCard key={`active-farm-${activeIndex}`}
                color="primary"
                highlight={true}
                poolAssets=
                {{
                  baseTokenName: "BASE",
                  baseTokenSymbol: "BT",
                  baseTokenImage: "base token url",

                  mainTokenName: "MAIN",
                  mainTokenSymbol: "MT",
                  mainTokenImage: "main token url",

                  swapName: "SWAPNAME",
                  swapLogo: "ape swap url",

                  pid,
                  mult,
                  isLP,
                  depositFee: fee || 0,
                  tokenAddress: token
                }}
              />
            )
          })
        }

      </div>
    </div>
  </PageContainer>
}

export default Farms


import Web3 from 'web3'
// CONTRACT
import { getContracts } from 'data/contracts'

export const getStaticProps: GetStaticProps = async () => {
  const activeFarms: Array<any> = []
  const inactiveFarms: Array<any> = []

  // CONNECT TO BLOCKCHAIN
  //MAINNET
  // const provider = 'https://bsc-dataseed1.defibit.io/'
  // TESTNET
  const provider = 'https://data-seed-prebsc-1-s1.binance.org:8545/'

  const web3 = new Web3(new Web3.providers.HttpProvider(provider))
  const setup = getContracts('galacticChef', 97)
  console.log("abi length", setup.abi?.length)
  if (setup.abi) {
    const contract = await new web3.eth.Contract(setup.abi, setup.address)

    // GET POOL COUNT FROM CHEF

    const poolAmount = await contract.methods.poolCounter().call()

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
      const stringData = JSON.stringify(parsedData)
      if (parsedData.mult > 0) {
        activeFarms.push(stringData)
      }
      else
        inactiveFarms.push(stringData)
    }
    // GET POOL DATA FROM CHEF (STATIC DATA)

    // GET ASSETS FROM SANITY
  }

  return {
    props: {
      activeFarms,
      inactiveFarms
    }
  }
}