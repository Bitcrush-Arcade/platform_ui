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
import { useTransactionContext } from 'hooks/contextHooks'
import { useWeb3React } from '@web3-react/core'
import { useContract, useAuth, ConnectorNames } from 'hooks/web3Hooks'
import { divide } from 'lodash'
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber'


type FarmCardProps = {
  color: "primary" | "secondary",
  highlight: boolean,
  // Image URL's and asset info will be received from sanity in farm page
  poolAssets: {
    baseTokenName: string,
    baseTokenSymbol: string,
    baseTokenImage: string,

    mainTokenName: string,
    mainTokenSymbol: string,
    mainTokenImage: string,

    swapName: string,
    swapLogo: string,

    pid: number,

  },

}
// Some will be received from web3 and others will be calculated here
type PoolDetailType = {
  hasFee: boolean,
  mult: BigNumber,
  apr: BigNumber,
  depositFee: BigNumber,
  earned: BigNumber,
  stakedAmount: BigNumber,
  deposit: BigNumber,
  totalLiquidity: BigNumber,
  isLp: boolean

}

const defaultPoolDetails: PoolDetailType = {
  hasFee: false,
  mult: new BigNumber(0),
  apr: new BigNumber(0),
  depositFee: new BigNumber(0),
  earned: new BigNumber(0),
  stakedAmount: new BigNumber(0),
  deposit: new BigNumber(0),
  totalLiquidity: new BigNumber(0),
  isLp: false
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
  const { login, logout } = useAuth()
  // Nice Token
  const tokenContract = getContracts(tokenAddress, chainId)
  const { methods: tokenMethods } = useContract(tokenContract.abi, tokenContract.address)

  // Galactic Chef
  const chefContract = getContracts('galacticChef', chainId)
  const { methods: chefMethods } = useContract(chefContract.abi, chefContract.address)
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
      draft.mult = new BigNumber(chefPoolInfo.mult).div(feeDiv).times(100) //Gives back %format
      draft.depositFee = new BigNumber(chefPoolInfo.fee).div(feeDiv)
      draft.stakedAmount = new BigNumber(chefUserInfo.amount).div(10 ** 18)
      draft.isLp = chefPoolInfo.isLp
    })


  }, [chefMethods, feeDistributorMethods, account])

  const getPoolEarnings = useCallback(async () => {

    if (!chefMethods || !tokenMethods || !account) return;

    const amountEarned = await chefMethods.pendingRewards(account, pid).call()
    const totalLiquidity = await tokenMethods.balanceOf(chefContract.address)

    setPool(draft => {
      draft.earned = new BigNumber(amountEarned).div(10 ** 18) // Value in ether dimension (NOT CURRENCY)
    })

  }, [chefMethods, account, pid])

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
              border-2 rounded-[32px] ${border[color]} ${highlightGlow[color]} w-[275px] md:w-[19rem] ${showDetails ? "" : account ? "max-h-[566px]" : "max-h-[426px]"}
              bg-paper-bg 
              text-white
              p-8
            `}
    >
      {/* Tokens, title and tags row */}
      <div className="flex justify-between ">

        <div className="flex h-[80px] w-[80px] relative">
          <div className="z-10" >
            <img src="https://cdn.sanity.io/images/yirb57h5/production/41e282e4cbb87b5faee99a10b972e25c5f9c4b57-209x209.png?w=50&h=50" height={"35px"} width={"35px"} />
          </div>
          <div className="absolute top-[calc(50%-25px)] left-[calc(50%-25px)] z-0">
            <img src="https://cdn.sanity.io/images/yirb57h5/production/41e282e4cbb87b5faee99a10b972e25c5f9c4b57-209x209.png?w=50&h=50" height={"60px"} width={"60px"} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="text-[1.3rem] font-bold md:text-[1.5rem] ">
            {mainTokenName}-{baseTokenName}
          </div>
          <div className="flex flex-row gap-1">
            <div className={`border-2 border-secondary rounded-full px-2 py-1 text-sm text-secondary ${pool.depositFee.isEqualTo(0) ? "" : "hidden"}`}>
              NO FEES
            </div>
            <div className="border-2 border-secondary rounded-full px-2 py-1 text-sm text-secondary">
              {pool.mult.toFixed(0) || "-"}X
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
          250 %
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
        <div className={`font-bold ${pool.depositFee.isEqualTo(0) ? "text-3xl" : ""}`}>
          {pool.depositFee.toFixed(2, 1) || "-"}%
        </div>
      </div>

      <div className={`${account ? "" : "hidden"}`}>
        <div className="form-label inline-block text-primary text-xs font-bold">
          NICE EARNED:
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[1.5rem]">
            {pool.earned.toFixed(2, 1) || "-"}
          </div>
          <button onClick={() => chefMethods.deposit(0, pid)} disabled={false} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-[17px] py-2.5 text-xs rounded-l-full rounded-br-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            HARVEST
          </button>
        </div>
      </div>

      <div className={`${account ? "" : "hidden"}`}>
        <div className="form-label inline-block text-primary text-xs font-bold">
          {mainTokenSymbol}-{baseTokenSymbol} {pool.isLp ? "LP" : ""} STAKED
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
          onClick={() => login(ConnectorNames.INJECTED)}
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
          disabled={false}
          className="
            flex flex-row justify-center items-center gap-2 
            border-2 border-secondary inner-glow-secondary px-6 py-4 my-4 
            text-xs rounded-full hover:bg-secondary 
            hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          APPROVE CONTRACT
        </button>
      }

      <hr className="border-slate-500" />

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
            {mainTokenName}-{baseTokenName} {pool.isLp ? "LP" : ""}

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
            <a className="inline-flex items-center gap-1" href="https://testnet.bscscan.com/address/0x9AB60Da7a00d4096498542d9EE6a9fef69Aa8d8B#code" target="_blank" rel="noopener noreferrer">
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
            <a className="inline-flex items-center gap-1" href="https://testnet.bscscan.com/address/0x9AB60Da7a00d4096498542d9EE6a9fef69Aa8d8B#code" target="_blank" rel="noopener noreferrer">
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
