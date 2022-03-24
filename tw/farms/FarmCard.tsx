import { useState, useCallback, useEffect, useMemo } from 'react'
import { useImmer } from 'use-immer'
import Image from 'next/image'
// mui
import Skeleton from "@mui/material/Skeleton"
// Bitcrush UI
// COMPONENTS
import { StakeModalProps, StakeOptionsType, SubmitFunction } from "components/basics/StakeModal"
import BigNumber from 'bignumber.js'
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
import { apiResolver } from 'next/dist/server/api-utils'


type FarmCardProps = {
  color: boolean,
  highlight: boolean,
  // Static props
  poolAssets: {
    //From Sanity
    baseTokenName?: string | null,
    baseTokenSymbol?: string | null,
    baseTokenImage?: string | null,

    mainTokenName: string,
    mainTokenSymbol: string,
    mainTokenImage: string,

    swapName: string,
    swapLogo: string,
    swapUrl: string,
    swapDexUrl: string,
    swapPoolUrl: string,

    //From blockchain
    pid: number,
    mult?: number,
    isLP: boolean,
    depositFee: number,
    tokenAddress: string
  },
  onAction: (options: Array<StakeOptionsType>, fn: SubmitFunction, initAction?: number, coinInfo?: StakeModalProps[ 'coinInfo' ]) => void;
}
// Some will be received from web3 and others will be calculated here
type PoolDetailType = {
  apr: BigNumber,
  earned: BigNumber,
  stakedAmount: BigNumber,
  deposit: BigNumber,
  totalLiquidity: BigNumber,
  userTokens: BigNumber,
}

const defaultPoolDetails: PoolDetailType = {
  apr: new BigNumber(0),
  earned: new BigNumber(0),
  stakedAmount: new BigNumber(0),
  deposit: new BigNumber(0),
  totalLiquidity: new BigNumber(0),
  userTokens: new BigNumber(0),
}


const FarmCard = (props: FarmCardProps) =>
{
  const { color, highlight, poolAssets, onAction } = props
  const {
    baseTokenName, baseTokenSymbol, baseTokenImage, mainTokenName, mainTokenSymbol, mainTokenImage,
    swapName, swapLogo, swapUrl, swapDexUrl, swapPoolUrl, pid
  }
    = poolAssets
  const [ showDetails, setShowDetails ] = useState<boolean>(false)
  const [ pool, setPool ] = useImmer<PoolDetailType>(defaultPoolDetails)
  // BLOCKCHAIN
  const options: Array<StakeOptionsType> = useMemo(() => [
    //Stake
    {
      name: "STAKE",
      maxValue: pool.userTokens,
      btnText: "Stake",
      description: `Stake $${mainTokenSymbol} to earn $NICE`,
    },
    //Withdraw
    {
      name: "withdraw",
      maxValue: pool.stakedAmount,
      btnText: "Withdraw",
      description: `Withdraw staked $${mainTokenSymbol}`
    }
  ], [ mainTokenSymbol, pool ])

  const coinInfoForModal = useMemo(() => ({
    symbol: poolAssets.isLP ? `${mainTokenSymbol}-${baseTokenSymbol}` : mainTokenSymbol,
    name: poolAssets.isLP ? `${poolAssets.swapName} LP ${mainTokenSymbol}-${baseTokenSymbol}` : mainTokenName,
    decimals: 18,
  }), [ mainTokenSymbol, mainTokenName, poolAssets, baseTokenSymbol ])

  const submitFn: SubmitFunction = (values, second) =>
  {
    console.log('submit', pid)
  }
  //hooks
  const { account, chainId } = useWeb3React()
  const { login, logout } = useAuthContext()
  // Stake Token
  const { coinMethods, isApproved, getApproved, approve } = useCoin(poolAssets.tokenAddress)

  // Galactic Chef
  const chefContract = getContracts('galacticChef', chainId)
  const { methods: chefMethods } = useContract(chefContract.abi, chefContract.address)

  // Fee Distributor, only used when fee>0
  const feeDistributorContract = getContracts('feeDistributor', chainId)
  const { methods: feeDistributorMethods } = useContract(feeDistributorContract.abi, feeDistributorContract.address)

  // Concatenates string with contract address to obtain BSC Scan url
  function getBscUrl(contractAddress: string)
  {
    let url;
    if (chainId == 56)
      url = "https://bscscan.com/address/" + contractAddress
    else
      url = "https://testnet.bscscan.com/address/" + contractAddress + "#code"

    return url
  }

  const getPoolInfo = useCallback(async () =>
  {
    if (!chefMethods || !feeDistributorMethods || !coinMethods || !chefContract) return;
    const feeDiv = await chefMethods.FEE_DIV().call()
    const chefPoolInfo = await chefMethods.poolInfo(pid).call()
    const chefUserInfo = await chefMethods.userInfo(pid, account).call()

    setPool(draft =>
    {
      draft.stakedAmount = new BigNumber(chefUserInfo.amount).div(10 ** 18)
    })


  }, [ chefMethods, feeDistributorMethods, account, pid, setPool, coinMethods, chefContract ])

  const getPoolEarnings = useCallback(async () =>
  {

    if (!chefMethods || !poolAssets.tokenAddress || !account) return;

    const amountEarned = await chefMethods.pendingRewards(account, pid).call()
    const totalLiquidity = await coinMethods.balanceOf(chefContract.address).call()
    const tokenInWallet = await coinMethods.balanceOf(account).call()


    setPool(draft =>
    {
      draft.userTokens = new BigNumber(tokenInWallet)
      draft.totalLiquidity = new BigNumber(totalLiquidity)
      draft.earned = new BigNumber(amountEarned).div(10 ** 18) // Value in ether dimension (NOT CURRENCY)
      draft.apr = new BigNumber(amountEarned).div(10 ** 18)
    })

  }, [ chefMethods, account, pid, poolAssets.tokenAddress, coinMethods ])

  // useEffect for pool earnings
  useEffect(() =>
  {
    if (!account) return;

    const interval = setInterval(getPoolEarnings, 5000);

    return () =>
    {
      clearInterval(interval)
    }

  }, [ account, getPoolEarnings ])

  // useEffect for pool info, used when first loading page
  useEffect(() =>
  {
    if (!account) return;
    getPoolInfo()
  }, [ getPoolInfo, account ])

  // useEffect to get approval of tokens
  useEffect(() =>
  {
    if (!poolAssets.tokenAddress || !chefContract.address || isApproved) return;
    getApproved(chefContract.address)
  }, [ chefContract, poolAssets, getApproved, isApproved ])

  const detailToggle = useCallback(() =>
  {
    setShowDetails(p => !p)
  }, [ setShowDetails ])

  const highlightGlow = {
    primary: highlight ? "box-highlight-primary" : "inner-glow-primary",
    secondary: highlight ? "box-highlight-secondary" : "inner-glow-secondary",
  }
  const border = {
    primary: "border-primary",
    secondary: "border-secondary",
  }

  const depositToken = useCallback((amount: BigNumber) =>
  {

  }, [ chefMethods, account ])
  return (
    // Farm card
    <div
      className={`
              flex flex-col gap-2
              border-2 rounded-[32px] ${border[ color ? "primary" : "secondary" ]} ${highlightGlow[ color ? "primary" : "secondary" ]} 
              w-[275px] md:w-[19rem] ${showDetails ? "" : !account || !isApproved ? "max-h-[410px]" : ""}
              bg-paper-bg 
              text-white
              py-6
              px-8
            `}
    >
      {/* Tokens, title and tags row */}
      <div className="flex justify-between ">

        <div className={`flex flex-col h-[80px] w-[80px] relative ${poolAssets.isLP ? "" : "justify-center"}`}>
          <div>
            <div className={`z-10  ${poolAssets.isLP ? "" : "hidden"}`} >
              {baseTokenImage && <Image src={baseTokenImage} height={35} width={35} alt="Farm Base Token" />}
            </div>
            <div className={`${poolAssets.isLP ? "absolute top-[calc(50%-25px)] left-[calc(50%-25px)] z-0" : "scale-[110%] pt-1"}`}>
              {mainTokenImage && <Image src={mainTokenImage} height={60} width={60} alt="Farm Main Token" />}
            </div>
          </div>
          <a className="text-xs whitespace-nowrap align-middle" href={poolAssets.isLP ? swapPoolUrl : swapDexUrl} target="_blank" rel="noopener noreferrer">
            <span className='align-middle'>
              <Image src={swapLogo} height={20} width={20} alt="swapLogo" />
            </span>
            &nbsp;
            {swapName}
          </a>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="text-[1.3rem] font-bold md:text-[1.5rem] ">
            {mainTokenSymbol}{poolAssets.isLP ? "-" + baseTokenName : ""}
          </div>
          <div className="flex flex-row gap-1 items-center">
            <div className={`border-2 border-secondary rounded-full px-2 py-1 text-[0.70rem] text-secondary ${poolAssets.depositFee == 0 ? "" : "hidden"}`}>
              NO FEES
            </div>
            <div className="border-2 border-secondary rounded-full px-2 py-1 text-[0.70rem] text-secondary font-bold">
              {poolAssets.mult}X
            </div>
          </div>
        </div>

      </div>

      {/* Data rows */}
      <div className="flex justify-between mt-4">
        <div className="text-primary">
          APR:
        </div>
        <div className="font-bold">
          250%
        </div>
        {/* {pool.apr ?
          <div className="font-bold">
            {pool.apr}
          </div>
          :
          <Skeleton />
        } */}

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
        <div className={`font-bold ${poolAssets.depositFee == 0 ? "text-2xl" : ""}`}>
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
            <button
              disabled={false} //DISABLE ONLY WHEN TOKEN WALLET AMOUNT == 0
              onClick={() => onAction(options, submitFn, 0, coinInfoForModal)}
              className="flex flex-row justify-center items-center border-2 border-primary inner-glow-primary px-[21px] text-[1.5rem] rounded-full hover:bg-primary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              +
            </button>
            <button
              disabled={false} //DISABLE ONLY WHEN STAKED AMOUNT == 0
              onClick={() => onAction(options, submitFn, 1, coinInfoForModal)}
              className="flex flex-row justify-center items-center border-2 border-secondary inner-glow-secondary px-[24px] text-[1.5rem] rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
              -
            </button>
          </div>
        </div>
      </div>

      {!account ?
        <button
          disabled={false}
          onClick={() => login()}
          className={`
            flex flex-row justify-center items-center gap-2 
            border-2 border-primary inner-glow-primary px-6 ${poolAssets.depositFee == 0 ? "mt-[8px]" : "mt-4"} py-4 my-4 
            text-xs rounded-full 
            hover:bg-primary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          CONNECT WALLET
        </button>
        :
        <button
          onClick={() => poolAssets.tokenAddress && approve(chefContract.address, new BigNumber(5000000000).times(10 ** 18))}
          disabled={!poolAssets.tokenAddress}
          className={`
            ${isApproved ? "hidden" : "block"}
            flex flex-row justify-center items-center gap-2 
            border-2 border-secondary inner-glow-secondary px-6 ${poolAssets.depositFee == 0 ? "mt-[8px]" : "mt-4"} py-4 my-4 
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
            {mainTokenSymbol}{poolAssets.isLP ? "-" + baseTokenSymbol : ""} {poolAssets.isLP ? "LP" : ""}

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
            <a className="inline-flex items-center gap-1" href={getBscUrl(chefContract.address)} target="_blank" rel="noopener noreferrer">
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
            <a className="inline-flex items-center gap-1" href={getBscUrl(poolAssets.tokenAddress)} target="_blank" rel="noopener noreferrer">
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
