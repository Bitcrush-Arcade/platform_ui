import { useCallback, useState, useEffect } from 'react'
import { useWeb3React } from "@web3-react/core"
import { getContracts } from "data/contracts"
import { useTransactionContext } from "./contextHooks"
import { useContract } from "./web3Hooks"

import BigNumber from 'bignumber.js'
import { Receipt } from 'types/PromiEvent'

const useCoin = (coinAddress?: string) =>
{

  const { chainId, account } = useWeb3React()
  const { editTransactions } = useTransactionContext()

  const { address: crushAddress, abi: crushAbi } = getContracts('crushToken', chainId)
  const tokenAddress = coinAddress || crushAddress
  const { methods: coinMethods, web3 } = useContract(crushAbi, tokenAddress)

  const [ isApproved, setIsApproved ] = useState<boolean>(false)

  const getApproved = useCallback(async (contractToCheck: string, amountToCheck?: number) =>
  {
    if (!coinMethods || !account) {
      setIsApproved(false)
      return
    }
    try {
      const allowance = await coinMethods.allowance(account, contractToCheck).call()
        .catch((e: any) => console.log('token not approved', coinAddress))
      console.log(allowance, allowance >= (amountToCheck ?? 1))
      setIsApproved(allowance >= (amountToCheck ?? 1))
      return allowance >= (amountToCheck ?? 1)
    }
    catch {
      return false
    }
  }, [ coinMethods, account, setIsApproved, coinAddress ])

  const approve = useCallback((contractToApprove: string, approveAmount?: number | BigNumber) =>
  {
    if (!coinMethods) return
    coinMethods.approve(contractToApprove, approveAmount?.toFixed() ?? new BigNumber(30000000000000000000000000).toFixed())
      .send({ from: account, gasPrice: parseInt(`${new BigNumber(10).pow(10)}`) })
      .on('transactionHash', (tx: string) =>
      {
        console.log('hash', tx)
        editTransactions(tx, 'pending', { description: `Approve TOKEN spend` })
      })
      .on('receipt', (rc: Receipt) =>
      {
        console.log('receipt', rc)
        editTransactions(rc.transactionHash, 'complete')
        getApproved(contractToApprove)
      })
      .on('error', (error: any, receipt: Receipt) =>
      {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error', error)
        getApproved(contractToApprove)
      })
  }, [ coinMethods, editTransactions, account, getApproved ])

  return {
    approve,
    getApproved,
    isApproved,
    coinMethods,
    web3
  }
}


export default useCoin