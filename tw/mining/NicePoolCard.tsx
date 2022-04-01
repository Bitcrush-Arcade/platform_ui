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
import { toWei } from 'web3-utils'
// hooks
import { useTransactionContext, useAuthContext } from 'hooks/contextHooks'
import useCoin from 'hooks/useCoin'
import { useWeb3React } from '@web3-react/core'
import { useContract } from 'hooks/web3Hooks'

// Types
import type { Receipt } from 'types/PromiEvent'



type FarmCardProps = {
  color: boolean,
  highlight: boolean,
  tags?: Array<string>,
  // Static props
  poolAssets: {
    //From Sanity
    poolContractAddress: string,

    rewardTokenName: string,
    rewardTokenSymbol: string,
    rewardTokenImage: string,
    rewardTokenContract: {
      mainAddress: string,
      testAddress: string,
    },


    stakeTokenName: string,
    stakeTokenSymbol: string,
    stakeTokenImage: string,
    stakeTokenContract: {
      mainAddress: string,
      testAddress: string,
    },

    projectName: string,
    projectLogo: string,
    projectUrl: string,
  },
  onAction: (options: Array<StakeOptionsType>, fn: SubmitFunction, initAction?: number, coinInfo?: StakeModalProps['coinInfo']) => void;
}
// Some will be received from web3 and others will be calculated here
type PoolDetailType = {
  apr: BigNumber,
  earned: BigNumber,
  stakedAmount: BigNumber,
  totalLiquidity: BigNumber,
  userTokens: BigNumber,
  depositFee: BigNumber,
}

const defaultPoolDetails: PoolDetailType = {
  apr: new BigNumber(0),
  earned: new BigNumber(0),
  stakedAmount: new BigNumber(0),
  totalLiquidity: new BigNumber(0),
  userTokens: new BigNumber(0),
  depositFee: new BigNumber(0),
}


const NicePoolCard = (props: FarmCardProps) => {
  const { color, highlight, poolAssets, onAction, tags } = props
  const {
    poolContractAddress, rewardTokenName, rewardTokenSymbol, rewardTokenImage, stakeTokenName,
    stakeTokenSymbol, stakeTokenImage, stakeTokenContract, projectName, projectLogo, projectUrl, rewardTokenContract
  }
    = poolAssets
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [pool, setPool] = useImmer<PoolDetailType>(defaultPoolDetails)
  const { editTransactions } = useTransactionContext()
  // BLOCKCHAIN
  const options: Array<StakeOptionsType> = useMemo(() => [
    //Stake
    {
      name: "STAKE",
      maxValue: pool.userTokens,
      btnText: "Stake",
      description: `Stake $${stakeTokenSymbol} to earn $${rewardTokenSymbol}`,
    },
    //Withdraw
    {
      name: "withdraw",
      maxValue: pool.stakedAmount.times(10 ** 18),
      btnText: "Withdraw",
      description: `Withdraw staked $${rewardTokenSymbol}`
    }
  ], [rewardTokenSymbol, pool, stakeTokenSymbol])

  const coinInfoForModal = useMemo(() => ({
    symbol: rewardTokenSymbol,
    name: rewardTokenName,
    decimals: 18,
  }), [rewardTokenSymbol, rewardTokenName, poolAssets])

  //hooks
  const { account, chainId } = useWeb3React()
  const { login } = useAuthContext()

  // Staked Token 
  const { coinMethods, isApproved, getApproved, approve } = useCoin(stakeTokenContract[chainId === 56 ? 'mainAddress' : 'testAddress'])

  // Pool 
  const poolContract = getContracts('invaderPool')
  const { methods: poolMethods } = useContract(poolContract.abi, poolContractAddress)

  // Fee Distributor, only used when fee>0
  const feeDistributorContract = getContracts('feeDistributor', chainId)
  const { methods: feeDistributorMethods } = useContract(feeDistributorContract.abi, feeDistributorContract.address)

  // Getting/sending the data
  const getPoolInfo = useCallback(async () => {
    if (!coinMethods || !poolMethods) return;
    const poolUserInfo = await poolMethods.userInfo(account).call()

    setPool(draft => {
      draft.stakedAmount = new BigNumber(poolUserInfo.amount)
    })
  }, [coinMethods, poolMethods, account, setPool])

  const getPoolEarnings = useCallback(async () => {
    if (!coinMethods || !poolMethods || !feeDistributorMethods) return;
    const poolUserInfo = await poolMethods.userInfo(account).call()
    const totalLiquidity = await coinMethods.balanceOf(poolContractAddress).call()
    const tokenInWallet = await coinMethods.balanceOf(account).call()

    setPool(draft => {
      draft.earned = new BigNumber(poolUserInfo.accClaim).div(10 ** 18)
      draft.totalLiquidity = new BigNumber(totalLiquidity).div(10 ** 18)
      draft.userTokens = new BigNumber(tokenInWallet)
    })
  }, [coinMethods, poolMethods, feeDistributorMethods, account, setPool, poolContractAddress])

  // useEffect for pool info when chaning account or the pool info changes
  useEffect(() => {
    if (!account) return;

    getPoolInfo()

  }, [getPoolInfo, account])

  // useEffect for pool earnings, refreshed every 5 seconds
  useEffect(() => {
    if (!account) return;

    const interval = setInterval(getPoolEarnings, 5000);

    return () => {
      clearInterval(interval)
    }
  }, [account, getPoolEarnings])

  // useEffect to get approval of tokens for the pool contract
  useEffect(() => {
    if (!stakeTokenContract || isApproved) return;
    getApproved(poolContractAddress)
  }, [poolContract, poolAssets, getApproved, isApproved, poolContractAddress, stakeTokenContract])

  // functions
  // submit function for the coin modal
  const submitFn: SubmitFunction = useCallback((values, second) => {
    const amount = toWei(values.stakeAmount.toFixed(18, 1))
    if (values.actionType == 0) {
      poolMethods.deposit(amount).send({ from: account })
        .on('transactionHash', (tx: string) => {
          console.log('hash', tx)
          editTransactions(tx, 'pending', { description: `Stake ${stakeTokenSymbol} in pool` })
        })
        .on('receipt', (rc: Receipt) => {
          console.log('receipt', rc)
          editTransactions(rc.transactionHash, 'complete')
          second.setSubmitting(false)
          getPoolEarnings()
        })
        .on('error', (error: any, receipt: Receipt) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
          second.setSubmitting(false)
        })
    }
    if (values.actionType == 1) {
      poolMethods.withdraw(amount).send({ from: account })
        .on('transactionHash', (tx: string) => {
          console.log('hash', tx)
          editTransactions(tx, 'pending', { description: `Withdraw ${stakeTokenSymbol} from pool` })
        })
        .on('receipt', (rc: Receipt) => {
          console.log('receipt', rc)
          editTransactions(rc.transactionHash, 'complete')
          second.setSubmitting(false)
          getPoolEarnings()
        })
        .on('error', (error: any, receipt: Receipt) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
          second.setSubmitting(false)
        })
    }
  }, [account, poolMethods, editTransactions, stakeTokenSymbol, getPoolEarnings])

  // HARVEST FUNCTION
  const harvestFn = useCallback(() => {
    poolMethods.deposit(0).send({ from: account })
      .on('transactionHash', (tx: string) => {
        console.log('hash', tx)
        editTransactions(tx, 'pending', { description: `Harvest ${rewardTokenSymbol}` })
      })
      .on('receipt', (rc: Receipt) => {
        console.log('receipt', rc)
        editTransactions(rc.transactionHash, 'complete')
        getPoolEarnings()
      })
      .on('error', (error: any, receipt: Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
      })

  }, [account, poolMethods, editTransactions, getPoolEarnings, rewardTokenSymbol])

  // Concatenates string with contract address to obtain BSC Scan url
  function getBscUrl(contractAddress: string) {
    let url;
    if (chainId == 56)
      url = "https://bscscan.com/address/" + contractAddress
    else
      url = "https://testnet.bscscan.com/address/" + contractAddress + "#code"

    return url
  }

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

  const approveContract = useCallback(async () => {
    if (!coinMethods) return;
    const amountToApprove = new BigNumber(await coinMethods.totalSupply().call()).times(1000)
    approve(poolContractAddress, amountToApprove)
  }, [approve, coinMethods, poolContractAddress])

  return (
    // Farm card
    <div
      className={`
        flex flex-col gap-2
        border-2 rounded-[32px] ${border[color ? "primary" : "secondary"]} ${highlightGlow[color ? "primary" : "secondary"]} 
        w-[275px] md:w-[19rem] ${showDetails ? "" : !account || !isApproved ? "max-h-[410px]" : ""}
        bg-paper-bg 
        text-white
        py-6
        px-8
      `}
    >
      {/* Tokens, title and tags row */}
      <div className="flex flex-row-reverse justify-between ">

        <div className="flex flex-col h-[80px] w-[80px] relative items-center">
          <div>
            <div className="scale-[110%] pt-1">
              {rewardTokenImage && <Image src={rewardTokenImage} height={60} width={60} alt={`Reward Token: ${rewardTokenName}`} />}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1">
          <div className="text-[1.3rem] font-bold md:text-[1.5rem] ">
            {rewardTokenSymbol}
          </div>
          <div className="flex flex-row gap-1 items-center">
            {
              tags?.length && tags.map((tag: string, tagIdx) => {
                return (
                  <div key={`${rewardTokenName}-${tagIdx}`} className={`border-2 border-secondary rounded-full px-2 py-1 text-[0.70rem] text-secondary`}>
                    {tag.toUpperCase()}
                  </div>
                )
              })
            }
          </div>
        </div>

      </div>

      {/* Data rows */}
      <div className="flex justify-between">
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
          {rewardTokenSymbol}
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
          className={`font-bold ${pool.depositFee.isEqualTo(0) ? "text-2xl" : ""}`}
        >
          {pool.depositFee.toFixed(2)}%
        </div>
      </div>

      <div className={`${isApproved ? "" : "hidden"}`}>
        <div className="form-label inline-block text-primary text-xs font-bold">
          {rewardTokenSymbol} EARNED:
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[1.5rem]">
            {pool.earned.toFixed(4, 1)}
          </div>
          <button
            onClick={harvestFn}
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
        <div className="form-label inline-block text-primary text-xs font-bold">
          {stakeTokenSymbol} STAKED
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[1.5rem]">
            {pool.stakedAmount.toFixed(4, 1)}
          </div>
          <div className="flex gap-2">
            <button
              disabled={pool.userTokens.isEqualTo(0)} //DISABLE ONLY WHEN TOKEN WALLET AMOUNT == 0
              onClick={() => onAction(options, submitFn, 0, coinInfoForModal)}
              className="flex flex-row justify-center items-center border-2 border-primary inner-glow-primary px-[21px] text-[1.5rem] rounded-full hover:bg-primary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              +
            </button>
            <button
              disabled={pool.stakedAmount.isEqualTo(0)} //DISABLE ONLY WHEN STAKED AMOUNT == 0
              onClick={() => onAction(options, submitFn, 1, coinInfoForModal)}
              className="flex flex-row justify-center items-center border-2 border-secondary inner-glow-secondary px-[24px] text-[1.5rem] rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
              -
            </button>
          </div>
        </div>
      </div>

      {
        !account ?
          <button
            disabled={false}
            onClick={login}
            className={`
            flex flex-row justify-center items-center gap-2 
            border-2 border-primary inner-glow-primary px-6 ${pool.depositFee.isEqualTo(0) ? "mt-[8px]" : "mt-4"} py-4 my-4 
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
            onClick={approveContract}
            disabled={false}
            className={`
            ${isApproved ? "hidden" : "block"}
            flex flex-row justify-center items-center gap-2 
            border-2 border-secondary inner-glow-secondary px-6 ${pool.depositFee.isEqualTo(0) ? "mt-[8px]" : "mt-4"} py-4 my-4 
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
            {stakeTokenSymbol}

          </div>
        </div>

        <div className="flex justify-between mb-2">
          <div className="text-primary">
            TOTAL LOCKED:
          </div>
          <div className="font-bold">
            {/* STILL NEEDS TO BE CONVERTED TO USD */}
            {pool.totalLiquidity.toFixed(2, 1)}
          </div>
        </div>

        <div className="flex flex-row justify-between">
          <div className="flex flex-col items-start">
            <a
              className="inline-flex items-center gap-1 text-secondary text-xs hover:text-white disabled:opacity-60 "
              href={getBscUrl(poolContractAddress)}
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
              href={getBscUrl(rewardTokenContract.mainAddress)}
              target="_blank"
              rel="noopener noreferrer"
            >
              VIEW TOKEN
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <a className="inline-flex whitespace-nowrap items-center gap-1 text-xs text-secondary hover:text-white" href={projectUrl} target="_blank" rel="noopener noreferrer">
            HOMEPAGE
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-[5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

    </div >

  )
}
export default NicePoolCard
