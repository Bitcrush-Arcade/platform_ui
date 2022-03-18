import { useState, useCallback, useMemo } from 'react'
// Bitcrush UI
// COMPONENTS
import StakeModal from "components/basics/StakeModal"
import BigNumber from 'bignumber.js'
// utils
import { currencyFormat } from "utils/text/text"
import { getContracts } from 'data/contracts'
import { imageBuilder } from 'utils/sanityConfig'

// hooks
import { useTransactionContext } from 'hooks/contextHooks'
import { useWeb3React } from '@web3-react/core'
import { useContract } from 'hooks/web3Hooks'

type FarmCardProps = {
  color: "primary" | "secondary",
  highlight: boolean,
  // Image URL's and asset info will be received from sanity 
  poolAssets: {
    baseTokenName: string,
    baseTokenSymbol: string,
    baseTokenImage: string,

    mainTokenName: string,
    mainTokenSymbol: string,
    mainTokenImage: string,

    pid: number,
    mainAddress: BigNumber,
    testAddress: BigNumber
  },

}
// Some will be received from web3 and others will be calculated here
type PoolDetailType = {
  hasFee: boolean,
  mult: number,
  apr: BigNumber,
  depositFee: BigNumber,
  earned: BigNumber,
  staked: BigNumber,
  deposit: BigNumber,
  totalLiquidity: BigNumber

} | null

const defaultPoolDetails: PoolDetailType = {
  hasFee: false,
  mult: 1,
  apr: new BigNumber(0.0),
  depositFee: new BigNumber(0.0),
  earned: new BigNumber(0.0),
  staked: new BigNumber(0.0),
  deposit: new BigNumber(0.0),
  totalLiquidity: new BigNumber(0.0)
}


const FarmCard = (props: FarmCardProps) => {
  const { color = "primary", highlight, poolAssets } = props
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [pool, setPool] = useState<PoolDetailType>(defaultPoolDetails)
  // BLOCKCHAIN
  const { account, chainId } = useWeb3React()
  // Nice Token
  const niceTokenContract = getContracts('niceToken', chainId)
  const { methods: niceTokenMethods } = useContract(niceTokenContract.abi, niceTokenContract.address)
  // Galactic Chef
  const chefContract = getContracts('galacticChef', chainId)
  const { methods: chefMethods } = useContract(chefContract.abi, chefContract.address)
  // Fee Distributor, only used when fee>0
  const feeDistributorContract = getContracts('feeDistributor', chainId)
  const { methods: feeDistributorMethods } = useContract(feeDistributorContract.abi, feeDistributorContract.address)

  // USEFFECT FOR PUBLIC VARIABLES AND FUNCTIONS FROM THE SOL CONTRACT

  const getPoolInfo = useCallback(async () => {
    if (!chefMethods || !feeDistributorMethods || !niceTokenMethods) return
    const amountEarned = await chefMethods.pendingRewards(account, poolAssets.pid).call()



  }, [chefMethods, account])


  const detailToggle = useCallback(() => {
    setShowDetails(p => !p)
  }, [setShowDetails])

  const highlightGlow = {
    primary: highlight ? "box-highlight-primary" : "inner-glow-primary",
    secondary: highlight ? "box-highlight-secondary" : "inner-glow-secondary",
  }
  const border = {
    primary: "border-primary",
    secondary: "border-secondary",
  }
  return (
    <div
      className={`
              flex flex-col gap-2
              border-2 rounded-[32px] ${border[color]} ${highlightGlow[color]} w-[275px] md:w-[19rem] ${showDetails ? "" : "max-h-[538px]"}
              bg-paper-bg 
              text-white
              p-8
            `}
    >

      <div className="flex justify-between ">
        <div className="flex border-2 border-primary max-h-[80px] max-w-[80px] relative">
          <div>
            BASE COIN
          </div>
          <div className="absolute top-[calc(50%-15px)] left-[calc(50%-15px)]">
            MAIN COIN
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[1.5rem] font-bold">
            NICE-BNB
          </div>
          <div className="flex flex-row gap-1">
            <div className="border-2 border-secondary rounded-full px-2 py-1 text-sm text-secondary">
              NO FEES
            </div>
            <div className="border-2 border-secondary rounded-full px-2 py-1 text-sm text-secondary">
              40X
            </div>
          </div>
        </div>

      </div>
      <div className="text-xs">
        SWAP
      </div>
      <div className="flex justify-between mt-4">
        <div className="text-primary">
          APR:
        </div>
        <div className="font-bold">
          250 %
        </div>
      </div>

      <div className="flex justify-between">
        <div className="text-primary">
          EARN:
        </div>
        <div className="font-bold">
          NICE+FEES
        </div>
      </div>

      <div className="flex justify-between">
        <div className="text-primary">
          DEPOSIT FEE:
        </div>
        <div className="font-bold">
          0.1 %
        </div>
      </div>

      <div>
        <div className="form-label inline-block text-primary text-xs font-bold">
          NICE EARNED:
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[1.5rem]">
            0.0
          </div>
          <button disabled={false} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-[17px] py-2.5 text-xs rounded-l-full rounded-br-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            HARVEST
          </button>
        </div>
      </div>

      <div>
        <div className="form-label inline-block text-primary text-xs font-bold">
          NICE-BNB LP STAKED
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[1.5rem]">
            0.0
          </div>
          <div className="flex gap-2">
            <button disabled={false} className="flex flex-row justify-center items-center border-2 border-primary inner-glow-primary px-[21px] text-[1.5rem] rounded-full hover:bg-primary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
              +
            </button>
            <button disabled={false} className="flex flex-row justify-center items-center border-2 border-secondary inner-glow-secondary px-[24px] text-[1.5rem] rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
              -
            </button>
          </div>
        </div>
      </div>


      <button disabled={false} className="flex flex-row justify-center items-center gap-2 border-2 border-secondary inner-glow-secondary px-6 py-4 my-4 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        APPROVE CONTRACT
      </button>

      <hr className="border-slate-500" />

      <button disabled={false} onClick={detailToggle} className="flex gap-1 justify-center text-secondary text-xs hover:text-white disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
        <div className={`flex items-center`}>
          <div>
            {showDetails ? "SHOW" : "HIDE"}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-[2px] ${showDetails ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className={`flex flex-col gap-2 ${showDetails ? "" : "hidden"}`}>
        <div className="flex justify-between mt-2">
          <div className="text-primary">
            DEPOSIT:
          </div>
          <div className="flex gap-1 items-center font-bold">
            NICE-BNB LP
            <button disabled={false} className="text-primary hover:text-white disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-between mb-2">
          <div className="text-primary">
            TOTAL LIQUIDITY:
          </div>
          <div className="font-bold">
            ${currencyFormat(21456789.123456, { decimalsToShow: 0 })}
          </div>
        </div>

        <div className="flex justify-center">
          <button disabled={false} className="flex items-center gap-1 text-secondary font-bold hover:text-white disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            VIEW CONTRACT
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-[4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

    </div>

  )
}
export default FarmCard 