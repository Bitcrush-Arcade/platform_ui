import { useState, useCallback, useEffect, useMemo } from 'react'
import { useImmer } from 'use-immer'
import Image from 'next/image'
// mui
import Skeleton from "@mui/material/Skeleton"
import BigNumber from 'bignumber.js'
import { AbiItem } from 'web3-utils'
// Bitcrush UI
// COMPONENTS
import { StakeModalProps, StakeOptionsType, SubmitFunction } from "components/basics/StakeModal"
import Currency from 'components/basics/Currency'
// utils
import { getContracts } from 'data/contracts'
import { toWei } from 'web3-utils'
// hooks
import { useTransactionContext, useAuthContext } from 'hooks/contextHooks'
import useCoin from 'hooks/useCoin'
import { useWeb3React } from '@web3-react/core'
import { useContract } from 'hooks/web3Hooks'

// Types
import type { Receipt } from 'types/PromiEvent'
import tokenAbi from 'abi/LPToken.json'
import { currencyFormat } from 'utils/text/text'


type FarmCardProps = {
  color: boolean,
  highlight: boolean,
  closeModal: () => void,
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
  totalLiquidity: BigNumber,
  userTokens: BigNumber,
  v1Staked: BigNumber
}

const defaultPoolDetails: PoolDetailType = {
  apr: new BigNumber(0),
  earned: new BigNumber(0),
  stakedAmount: new BigNumber(0),
  totalLiquidity: new BigNumber(0),
  userTokens: new BigNumber(0),
  v1Staked: new BigNumber(0)
}


const FarmCard = (props: FarmCardProps) =>
{
  const { color, highlight, poolAssets, onAction, closeModal } = props
  const {
    baseTokenName, baseTokenSymbol, baseTokenImage, mainTokenName, mainTokenSymbol, mainTokenImage,
    swapName, swapLogo, swapUrl, swapDexUrl, swapPoolUrl, pid, mult
  }
    = poolAssets
  const [ showDetails, setShowDetails ] = useState<boolean>(false)
  const [ pool, setPool ] = useImmer<PoolDetailType>(defaultPoolDetails)
  const [ apyData, setApyData ] = useState<any>({
    d1: 0,
    d7: 0,
    d30: 0,
    d365: 0,
  })

  const isPool = useMemo(() =>
  {
    return !baseTokenSymbol
  }, [ baseTokenSymbol ])

  const { editTransactions } = useTransactionContext()
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
      maxValue: pool.stakedAmount.times(10 ** 18),
      btnText: "Withdraw",
      description: `Withdraw staked $${mainTokenSymbol}`
    }
  ], [ mainTokenSymbol, pool ])

  const coinInfoForModal = useMemo(() => ({
    symbol: poolAssets.isLP ? `${mainTokenSymbol}-${baseTokenSymbol}` : mainTokenSymbol,
    name: poolAssets.isLP ? `${poolAssets.swapName} LP ${mainTokenSymbol}-${baseTokenSymbol}` : mainTokenName,
    decimals: 18,
  }), [ mainTokenSymbol, mainTokenName, poolAssets, baseTokenSymbol ])

  //hooks
  const { account, chainId } = useWeb3React()
  const { login, logout } = useAuthContext()
  // Stake Token
  const { coinMethods, isApproved, getApproved, approve } = useCoin(poolAssets.tokenAddress)
  const { methods: tokenMethods } = useContract(tokenAbi.abi as AbiItem[], poolAssets.tokenAddress)
  //  @dev NEW Galactic Chef
  const chefContract = getContracts('galacticChef', chainId)
  const { methods: chefMethods } = useContract(chefContract.abi, chefContract.address)

  // @dev OLD Galactic Chef B1 
  const V1ChefContract = getContracts('oldGalacticChef', chainId)
  const { methods: V1ChefMethods } = useContract(V1ChefContract.abi, V1ChefContract.address)

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
    if (!chefMethods || !feeDistributorMethods || !coinMethods || !chefContract || !V1ChefMethods) return;
    const feeDiv = await chefMethods.FEE_DIV().call()
    const chefPoolInfo = await chefMethods.poolInfo(pid).call()
    const chefUserInfo = await chefMethods.userInfo(pid, account).call()
    const totalLiquidity = await tokenMethods.balanceOf(chefContract.address).call().catch(() => { console.log('chef bal failed'); return 0 })
    const oldStaked = await V1ChefMethods.userInfo(pid, account).call().catch(() => { console.log('user v1 bal failed'); return 0 })

    setPool(draft =>
    {
      draft.totalLiquidity = new BigNumber(totalLiquidity || 0).div(10 ** 18)
      draft.stakedAmount = new BigNumber(chefUserInfo.amount).div(10 ** 18)
      draft.v1Staked = new BigNumber(oldStaked.amount).div(10 ** 18)
    })


  }, [ chefMethods, feeDistributorMethods, account, pid, setPool, coinMethods, chefContract, tokenMethods, V1ChefMethods ])

  const getPoolEarnings = useCallback(async () =>
  {

    if (!chefMethods || !poolAssets.tokenAddress || !account || !tokenMethods) return;

    const amountEarned = await chefMethods.pendingRewards(account, pid).call().catch(() => { console.log('pending failed', pid); return 0 })
    const totalLiquidity = await tokenMethods.balanceOf(chefContract.address).call().catch(() => { console.log('chef bal failed'); return 0 })
    const tokenInWallet = await tokenMethods.balanceOf(account).call().catch(() => { console.log('user tokenfailed'); return 0 })
    const chefUserInfo = await chefMethods.userInfo(pid, account).call().catch(() => { console.log('chef user failed'); return 0 })

    setPool(draft =>
    {
      draft.userTokens = new BigNumber(tokenInWallet)
      draft.totalLiquidity = new BigNumber(totalLiquidity || 0).div(10 ** 18)
      draft.earned = new BigNumber(amountEarned).div(10 ** 18) // Value in ether dimension (NOT WEI)
      draft.apr = new BigNumber(amountEarned).div(10 ** 18)
      draft.stakedAmount = new BigNumber(chefUserInfo.amount).div(10 ** 18)

    })

  }, [ chefMethods, account, pid, poolAssets.tokenAddress, tokenMethods, chefContract.address, setPool ])

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

  // useEffect for pool info when chaning account or the pool info changes
  useEffect(() =>
  {
    if (!account) return;
    const interval = setInterval(getPoolInfo, 5000)
    return () =>
    {
      clearInterval(interval)
    }
  }, [ getPoolInfo, account ])

  // useEffect to get approval of tokens
  useEffect(() =>
  {
    if (!poolAssets.tokenAddress || !chefContract.address || isApproved) return;
    let interval = setInterval(() => getApproved(chefContract.address), 1500)
    return () => clearInterval(interval)
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

  const getApy = useCallback(async () =>
  {
    const data = await fetch('/api/chefApy', {
      method: 'POST',
      body: JSON.stringify({ pid, chainId })
    })
      .then(r => r.json())
      .catch(e =>
      {
        console.log('ERROR', e)
        return {
          d1: 0
        }
      })
    setApyData(data)
  }, [ pid, chainId ])

  const submitFn: SubmitFunction = useCallback((values, second) =>
  {
    const amount = toWei(values.stakeAmount.toFixed(18, 1))
    if (values.actionType == 0) {
      chefMethods.deposit(amount, pid).send({ from: account })
        .on('transactionHash', (tx: string) =>
        {
          console.log('hash', tx)
          editTransactions(tx, 'pending', { description: `Stake ${poolAssets.isLP ? "LP" : mainTokenSymbol} in chef` })
        })
        .on('receipt', (rc: Receipt) =>
        {
          console.log('receipt', rc)
          editTransactions(rc.transactionHash, 'complete')
          second.setSubmitting(false)
          getPoolEarnings()
          getApy()
        })
        .on('error', (error: any, receipt: Receipt) =>
        {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
          second.setSubmitting(false)
        })
        .finally(closeModal)
    }
    if (values.actionType == 1) {
      chefMethods.withdraw(amount, pid).send({ from: account })
        .on('transactionHash', (tx: string) =>
        {
          console.log('hash', tx)
          editTransactions(tx, 'pending', { description: `Withdraw ${poolAssets.isLP ? "LP" : mainTokenSymbol} from chef` })
        })
        .on('receipt', (rc: Receipt) =>
        {
          console.log('receipt', rc)
          editTransactions(rc.transactionHash, 'complete')
          second.setSubmitting(false)
          getPoolEarnings()
          getApy()
        })
        .on('error', (error: any, receipt: Receipt) =>
        {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
          second.setSubmitting(false)
        })
        .finally(closeModal)

    }
  }, [ account, chefMethods, pid, poolAssets.isLP, editTransactions, mainTokenSymbol, getPoolEarnings, getApy, closeModal ])

  // HARVEST FUNCTION
  const harvestFn = useCallback(() =>
  {
    const amount = new BigNumber(0).toString()
    chefMethods.deposit(amount, pid).send({ from: account })
      .on('transactionHash', (tx: string) =>
      {
        console.log('hash', tx)
        editTransactions(tx, 'pending', { description: `Harvest NICE` })
      })
      .on('receipt', (rc: Receipt) =>
      {
        console.log('receipt', rc)
        editTransactions(rc.transactionHash, 'complete')
        getPoolEarnings()
      })
      .on('error', (error: any, receipt: Receipt) =>
      {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
      })

  }, [ account, chefMethods, editTransactions, getPoolEarnings, pid ])

  const emergencyWithdraw = () =>
  {
    chefMethods.emergencyWithdraw(pid).send({ from: account })
      .on('transactionHash', (tx: string) =>
      {
        console.log('hash', tx)
        editTransactions(tx, 'pending', { description: `E. Withdraw ${poolAssets.isLP ? "LP" : mainTokenSymbol} in chef` })
      })
      .on('receipt', (rc: Receipt) =>
      {
        console.log('receipt', rc)
        editTransactions(rc.transactionHash, 'complete')
        getPoolEarnings()
      })
      .on('error', (error: any, receipt: Receipt) =>
      {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
      })
  }

  const withdrawV1 = useCallback(async () =>
  {
    V1ChefMethods.withdraw(pid, pool.v1Staked.times(10 ** 18).toString())
      .send({ from: account })
      .on('transactionHash', (tx: string) =>
      {
        console.log('hash', tx)
        editTransactions(tx, 'pending', { description: `V1 Withdraw ${poolAssets.isLP ? "LP" : mainTokenSymbol} in chef` })
      })
      .on('receipt', (rc: Receipt) =>
      {
        console.log('receipt', rc)
        editTransactions(rc.transactionHash, 'complete')
        getPoolInfo()
      })
      .on('error', (error: any, receipt: Receipt) =>
      {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
      })
  }, [ V1ChefMethods, account, pid, pool.v1Staked, editTransactions, getPoolInfo, mainTokenSymbol, poolAssets.isLP ])

  useEffect(() =>
  {
    if (!chainId || !pid) return;
    getApy()
  }, [ getApy, chainId, pid ])

  return (
    // Farm card
    <div
      className={`
              flex flex-col gap-2
              border-2 rounded-[32px] ${border[ color ? "primary" : "secondary" ]} ${highlightGlow[ color ? "primary" : "secondary" ]} 
              w-[275px] md:w-[19rem] ${showDetails ? "" : !account || !isApproved ? "max-h-[440px]" : ""}
              bg-paper-bg 
              text-white
              py-6
              px-8
            `}
    >
      {/* Tokens, title and tags row */}
      <div className={`flex justify-between ${isPool ? "flex-row-reverse" : ""}`}>

        <div className={`flex flex-col h-[80px] w-[80px] relative ${poolAssets.isLP ? "" : "justify-center"}`}>
          <div>
            {poolAssets.isLP && <div className={`z-10`} >
              {baseTokenImage && <Image src={baseTokenImage} height={40} width={40} alt="Farm Base Token" />}
            </div>}
            <div className={`${poolAssets.isLP ? "absolute top-[0] left-[calc(50%-15px)] z-0" : "scale-[100%] pt-1"}`}>
              {mainTokenImage && <Image src={mainTokenImage} height={isPool ? 60 : 40} width={isPool ? 60 : 40} alt="Farm Main Token" />}
            </div>
          </div>
          {poolAssets.isLP && <a className={`text-xs whitespace-nowrap align-middle`}>
            <span className='align-middle'>
              {swapLogo && <Image src={swapLogo} height={20} width={20} alt="swapLogo" />}
            </span>
            &nbsp;
            {swapName}
          </a>}
        </div>

        <div className={`flex flex-col ${isPool ? "items-start" : "items-end"} gap-1`}>
          <div className={`text-[1.3rem] font-bold md:text-[1.3rem] ${isPool ? "text-left pl-2" : "text-right"} w-full`}>
            {mainTokenSymbol}{poolAssets.isLP ? "-" + baseTokenSymbol : ""}
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
      <div className="flex justify-between">
        <div className="text-primary">
          APR:
        </div>
        <div className="font-bold">
          {(poolAssets.mult ?? 0) == 0 ?
            "0.00%"
            :
            (apyData.apr
              ?
              currencyFormat(apyData.apr, { decimalsToShow: 2 }) + "%"
              :
              <Skeleton width={90} />)
          }
        </div>
      </div>
      {(poolAssets.mult ?? 0) > 0 && <div className="flex justify-between">
        <div className="text-primary text-[1rem]">
          TOKEN PRICE:
        </div>
        <div className="font-bold">
          {
            apyData.tokenPrice
              ?
              apyData.tokenPrice < 0.01 ? currencyFormat(apyData.tokenPrice, { decimalsToShow: 4, isWei: false }) : currencyFormat(apyData.tokenPrice, { decimalsToShow: 2, isWei: false })
              :
              <Skeleton width={90} />
          }
        </div>
      </div>}
      {
        isPool &&
        <div className="flex justify-between mt-2">
          <div className="text-primary">
            DEPOSIT:
          </div>
          <div className="flex gap-1 items-center font-bold">
            {mainTokenSymbol}{poolAssets.isLP ? "-" + baseTokenSymbol : ""} {poolAssets.isLP ? "LP" : ""}

          </div>
        </div>
      }
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
        <div
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          title="Fee detail"
          className={`font-bold ${poolAssets.depositFee == 0 ? "text-2xl" : ""}`}
        >
          {poolAssets.depositFee.toFixed(2)}%
        </div>
      </div>

      <div className={`${isApproved ? "" : "hidden"}`}>
        <div className="form-label inline-block text-primary text-xs font-bold">
          NICE EARNED:
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[1.2rem]">
            <Currency value={pool.earned.toFixed(18, 1)} decimals={2} />
          </div>
          <button
            onClick={() => harvestFn()}
            disabled={pool.earned.isEqualTo(0)}
            className="
              flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-[17px] py-2.5 
              text-xs rounded-l-full rounded-br-full 
              hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            HARVEST
          </button>
        </div>
      </div>

      <div className={`${isApproved ? "" : "hidden"}`}>
        <>
          <div className="form-label inline-block text-primary text-xs font-bold">
            {mainTokenSymbol}{poolAssets.isLP ? "-" + baseTokenSymbol : ""} {poolAssets.isLP ? "LP" : ""} STAKED
          </div>
          <div className="text-[1.4rem] w-full text-right">
            <Currency value={pool.stakedAmount.toFixed(18, 1)} decimals={2} />
          </div>
          <div className="flex gap-2 justify-end w-full">
            <button
              disabled={pool.userTokens.isEqualTo(0) || mult == 0} //DISABLE ONLY WHEN TOKEN WALLET AMOUNT == 0
              onClick={() => onAction(options, submitFn, 0, coinInfoForModal)}
              className="flex border-2 border-primary inner-glow-primary px-[21px] text-[1.5rem] rounded-full hover:bg-primary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              +
            </button>
            <button
              disabled={pool.stakedAmount.isEqualTo(0)} //DISABLE ONLY WHEN STAKED AMOUNT == 0
              onClick={() => onAction(options, submitFn, 1, coinInfoForModal)}
              className="flex border-2 border-secondary inner-glow-secondary px-[24px] text-[1.5rem] rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
              -
            </button>
          </div>
        </>
        {
          pool.v1Staked.isGreaterThan(0) &&
          <>
            <div className="form-label inline-block text-primary text-xs font-bold">
              V1 STAKED
            </div>
            <div className="text-[1.4rem] w-full text-right">
              <Currency value={pool.v1Staked.toFixed(18, 1)} decimals={2} />
            </div>
            <div className="flex justify-end">
              <button
                onClick={withdrawV1}
                className="
                flex flex-row items-center gap-2 
                border-2 border-secondary inner-glow-secondary
                px-[17px] py-2.5 mt-1 
                text-xs rounded-l-full rounded-br-full 
                hover:bg-secondary hover:text-black 
                disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
              >
                WITHDRAW FROM V1
              </button>
            </div>
          </>
        }
      </div>

      {
        !account ?
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

      <button disabled={false} onClick={detailToggle} className="flex justify-center items-center text-secondary text-xs hover:text-white disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
        <div>
          {showDetails ? "HIDE" : "SHOW"}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-[2px] ${showDetails ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`flex flex-col gap-1 ${showDetails ? "" : "hidden"}`}>
        <div className="flex justify-between mt-2">
          <div className="text-primary">
            DEPOSIT:
          </div>
          <div className="flex gap-1 items-center font-bold">
            {mainTokenSymbol}{poolAssets.isLP ? "-" + baseTokenSymbol : ""} {poolAssets.isLP ? "LP" : ""}

          </div>
        </div>

        <div className="text-primary w-full text-left">
          TOTAL LOCKED:
        </div>
        <div>
          <div className="font-bold text-right ">
            {/* STILL NEEDS TO BE CONVERTED TO USD */}
            USD <Currency value={pool.totalLiquidity.times(apyData.tokenPrice).toFixed(2, 1)} decimals={2} />
          </div>
          <div className="font-bold text-right text-slate-400">
            {/* STILL NEEDS TO BE CONVERTED TO USD */}
            <Currency value={pool.totalLiquidity.toFixed(2, 1)} decimals={2} />
          </div>
        </div>

        <div className="flex flex-row justify-between">
          <div className="flex flex-col items-start">
            <a
              className="inline-flex items-center gap-1 text-secondary text-xs hover:text-white disabled:opacity-60 "
              href={getBscUrl(chefContract.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              VIEW POOL
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              className="inline-flex items-center gap-1 text-secondary text-xs hover:text-white disabled:opacity-60 "
              href={getBscUrl(poolAssets.tokenAddress)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {poolAssets.isLP ? "VIEW LP TOKEN" : "VIEW TOKEN"}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          {(poolAssets.swapPoolUrl || poolAssets.swapDexUrl) && <a className="inline-flex whitespace-nowrap items-center gap-1 text-xs text-secondary hover:text-white" href={poolAssets.isLP ? swapPoolUrl : swapDexUrl} target="_blank" rel="noopener noreferrer">
            {poolAssets.isLP ? "SWAP LP" : "SWAP"}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </a>}

        </div>
        <button
          className="inline-flex whitespace-nowrap items-center gap-1 text-xs text-red hover:text-black"
          onClick={emergencyWithdraw}
        >
          EMERGENCY WITHDRAW
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </button>
      </div>

    </div >

  )
}
export default FarmCard
