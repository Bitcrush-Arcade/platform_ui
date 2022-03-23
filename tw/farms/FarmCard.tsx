import { useState, useCallback, useEffect } from 'react'
import { useImmer } from 'use-immer'
// Bitcrush UI
// COMPONENTS
import StakeModal from "components/basics/StakeModal"
import BigNumber from 'bignumber.js'
import Image from 'next/image'
// utils
import { currencyFormat } from "utils/text/text"
import { getContracts } from 'data/contracts'
import { imageBuilder } from 'utils/sanityConfig'
// hooks
import { useTransactionContext, useAuthContext } from 'hooks/contextHooks'
import useCoin from 'hooks/useCoin'
import { useWeb3React } from '@web3-react/core'
import { useContract, ConnectorNames } from 'hooks/web3Hooks'
import { divide } from 'lodash'
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber'


type FarmCardProps = {
  color: "primary" | "secondary",
  highlight: boolean,
  // Static props
  poolAssets: {
    //From Sanity
    baseTokenName: string,
    baseTokenSymbol: string,
    baseTokenImage: string,

    mainTokenName: string,
    mainTokenSymbol: string,
    mainTokenImage: string,

    swapName: string,
    swapLogo: string,

    //From blockchain
    pid: number,
    mult?: number,
    isLP: boolean,
    depositFee: number,
    tokenAddress: string
  },

}
// Some will be received from web3 and others will be calculated here
type PoolDetailType = {
  apr: BigNumber,
  earned: BigNumber,
  stakedAmount: BigNumber,
  deposit: BigNumber,
  totalLiquidity: BigNumber,
  tokenAddress: string,
}

const defaultPoolDetails: PoolDetailType = {
  apr: new BigNumber(0),
  earned: new BigNumber(0),
  stakedAmount: new BigNumber(0),
  deposit: new BigNumber(0),
  totalLiquidity: new BigNumber(0),
  tokenAddress: "",
}


const FarmCard = (props: FarmCardProps) => {
  const { color = "primary", highlight, poolAssets } = props
  const {
    baseTokenName, baseTokenSymbol, baseTokenImage, mainTokenName, mainTokenSymbol, mainTokenImage,
    swapName, swapLogo, pid
  }
    = poolAssets
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [pool, setPool] = useImmer<PoolDetailType>(defaultPoolDetails)
  // BLOCKCHAIN
  //hooks
  const { account, chainId } = useWeb3React()
  const { login, logout } = useAuthContext()
  // Stake Token
  const { coinMethods, isApproved, getApproved, approve } = useCoin(pool.tokenAddress)
  const tokenHyperlink = "https://bscscan.com/address/" + pool.tokenAddress
  // Galactic Chef
  const chefContract = getContracts('galacticChef', chainId)
  const { methods: chefMethods } = useContract(chefContract.abi, chefContract.address)
  const chefHyperlink = "https://testnet.bscscan.com/address/" + chefContract.address + "#code"
  // Fee Distributor, only used when fee>0
  const feeDistributorContract = getContracts('feeDistributor', chainId)
  const { methods: feeDistributorMethods } = useContract(feeDistributorContract.abi, feeDistributorContract.address)

  const getPoolInfo = useCallback(async () => {
    if (!chefMethods || !feeDistributorMethods) return;
    const feeDiv = await chefMethods.FEE_DIV().call()
    const chefPoolInfo = await chefMethods.poolInfo(pid).call()
    const tokenAddress = await chefPoolInfo.token
    const chefUserInfo = await chefMethods.userInfo(pid).call()

    setPool(draft => {

      draft.stakedAmount = new BigNumber(chefUserInfo.amount).div(10 ** 18)
    })


  }, [chefMethods, feeDistributorMethods, account])

  const getPoolEarnings = useCallback(async () => {

    if (!chefMethods || !pool.tokenAddress || !account) return;

    const amountEarned = await chefMethods.pendingRewards(account, pid).call()
    const totalLiquidity = await coinMethods.balanceOf(chefContract.address).call()

    setPool(draft => {
      draft.earned = new BigNumber(amountEarned).div(10 ** 18) // Value in ether dimension (NOT CURRENCY)
    })

  }, [chefMethods, account, pid, pool.tokenAddress, coinMethods])

  // useEffect for pool earnings
  useEffect(() => {
    if (!account) return;

    const interval = setInterval(getPoolEarnings, 5000);

    return () => {
      clearInterval(interval)
    }

  }, [account, getPoolEarnings])

  // useEffect for pool info, used when first loading page
  useEffect(() => {
    if (!account) return;
    getPoolInfo()
  }, [getPoolInfo, account])


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
    // Farm card
    <div
      className={`
              flex flex-col gap-2
              border-2 rounded-[32px] ${border[color]} ${highlightGlow[color]} w-[275px] md:w-[19rem] ${showDetails ? "" : !account || !isApproved ? "max-h-[440px]" : ""}
              bg-paper-bg 
              text-white
              py-6
              px-8
            `}
    >
      {/* Tokens, title and tags row */}
      <div className="flex justify-between ">

        <div className={`flex h-[80px] w-[80px] relative ${poolAssets.isLP ? "" : "justify-center"}`}>
          <div className={`z-10  ${poolAssets.isLP ? "" : "hidden"}`} >
            <img src="https://cdn.sanity.io/images/yirb57h5/production/41e282e4cbb87b5faee99a10b972e25c5f9c4b57-209x209.png?w=50&h=50" height={"35px"} width={"35px"} />
          </div>
          <div className={`${poolAssets.isLP ? "absolute top-[calc(50%-25px)] left-[calc(50%-25px)] z-0" : "scale-[110%] pt-1"}`}>
            <img src="https://cdn.sanity.io/images/yirb57h5/production/41e282e4cbb87b5faee99a10b972e25c5f9c4b57-209x209.png?w=50&h=50" height={"60px"} width={"60px"} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="text-[1.3rem] font-bold md:text-[1.5rem] ">
            {mainTokenName}{poolAssets.isLP ? "-" + baseTokenName : ""}
          </div>
          <div className="flex flex-row gap-1">
            <div className={`border-2 border-secondary rounded-full px-2 py-1 text-sm text-secondary ${poolAssets.depositFee == 0 ? "" : "hidden"}`}>
              NO FEES
            </div>
            <div className="border-2 border-secondary rounded-full px-2 py-1 text-sm text-secondary">
              {poolAssets.mult}X
            </div>
          </div>
        </div>

      </div>
      <div className="flex items-center justify-start text-xs gap-2">
        <div>
          <img className="pb-[2px]" src="https://cdn.sanity.io/images/yirb57h5/production/41e282e4cbb87b5faee99a10b972e25c5f9c4b57-209x209.png?w=50&h=50" height={"20px"} width={"20px"} />
        </div>
        {swapName} ROUTER
      </div>
      {/* Data rows */}
      <div className="flex justify-between mt-4">
        <div className="text-primary">
          APR:
        </div>
        <div className="font-bold">
          250%
        </div>
      </div>

      <div className="flex justify-between">
        <div className="text-primary">
          EARN:
        </div>
        <div className="font-bold">
          NICE
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-primary">
          DEPOSIT FEE:
        </div>
        <div className={`font-bold ${poolAssets.depositFee == 0 ? "text-3xl" : ""}`}>
          {poolAssets.depositFee.toFixed(2)}%
        </div>
      </div>

      <div className={`${isApproved ? "" : "hidden"}`}>
        <div className="form-label inline-block text-primary text-xs font-bold">
          NICE EARNED:
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[1.5rem]">
            {pool.earned.toFixed(2, 1)}
          </div>
          <button onClick={() => chefMethods.deposit(0, pid)} disabled={false} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-[17px] py-2.5 text-xs rounded-l-full rounded-br-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            HARVEST
          </button>
        </div>
      </div>

      <div className={`${isApproved ? "" : "hidden"}`}>
        <div className="form-label inline-block text-primary text-xs font-bold">
          {mainTokenSymbol}{poolAssets.isLP ? "-" + baseTokenSymbol : ""} {poolAssets.isLP ? "LP" : ""} STAKED
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[1.5rem]">
            {pool.stakedAmount.toFixed(2, 1)}
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

      {!account ?
        <button
          disabled={false}
          onClick={() => login()}
          className="
            flex flex-row justify-center items-center gap-2 
            border-2 border-primary inner-glow-primary px-6 py-4 my-4 text-xs rounded-full 
            hover:bg-primary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          CONNECT WALLET
        </button>
        :
        <button
          onClick={() => !pool.tokenAddress && approve(chefContract.address, new BigNumber(5000000000).times(10 ** 18))}
          disabled={!pool.tokenAddress}
          className={`
            ${isApproved ? "hidden" : "block"}
            flex flex-row justify-center items-center gap-2 
            border-2 border-secondary inner-glow-secondary px-6 py-4 my-4 
            text-xs rounded-full hover:bg-secondary 
            hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          APPROVE CONTRACT
        </button>
      }

      <hr className="border-slate-500 my-3" />

      <button disabled={false} onClick={detailToggle} className="flex gap-1 justify-center text-secondary text-xs hover:text-white disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
        <div className={`flex items-center`}>
          <div>
            {showDetails ? "HIDE" : "SHOW"}
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
            {mainTokenName}{poolAssets.isLP ? "-" + baseTokenName : ""} {poolAssets.isLP ? "LP" : ""}

          </div>
        </div>

        <div className="flex justify-between mb-2">
          <div className="text-primary">
            TOTAL LIQUIDITY:
          </div>
          <div className="font-bold">
            {/* STILL NEEDS TO BE CONVERTED TO USD */}
            {pool.totalLiquidity.toFixed(2, 1)}
          </div>
        </div>

        <div className="flex flex-col items-start">
          <button
            disabled={false}
            className="
              flex items-center gap-1 
              text-secondary text-xs  
              hover:text-white disabled:opacity-60 
              disabled:hover:bg-transparent disabled:hover:text-white
            "
          >
            <a className="inline-flex items-center gap-1" href={chefHyperlink} target="_blank" rel="noopener noreferrer">
              VIEW POOL
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </button>
          <button
            disabled={false}
            className="
              flex items-center gap-1 
              text-secondary text-xs  
              hover:text-white disabled:opacity-60 
              disabled:hover:bg-transparent disabled:hover:text-white
            "
          >
            <a className="inline-flex items-center gap-1" href={tokenHyperlink} target="_blank" rel="noopener noreferrer">
              VIEW TOKEN
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </button>
        </div>
      </div>

    </div>

  )
}
export default FarmCard
