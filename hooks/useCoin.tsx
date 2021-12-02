import { useCallback, useState, useEffect } from 'react'
import { useWeb3React } from "@web3-react/core"
import { getContracts } from "data/contracts"
import { useTransactionContext } from "./contextHooks"
import { useContract } from "./web3Hooks"

import BigNumber from 'bignumber.js'

const useCoin = (coinAddress?: string) => {
  
  const { chainId, account } = useWeb3React()
  const { editTransactions } = useTransactionContext()

  const { address: crushAddress, abi: crushAbi } = getContracts('crushToken', chainId)
  const tokenAddress = coinAddress || crushAddress
  const { methods: coinMethods, web3 } = useContract( crushAbi, tokenAddress)

  const [isApproved, setIsApproved] = useState<boolean>(false)

  const getApproved = useCallback( async (contractToCheck: string, amountToCheck?: number) => {
    if(!coinMethods || !account){
      setIsApproved(false)
      return
    }
    const allowance = await coinMethods.allowance(account,contractToCheck).call()
    setIsApproved( allowance >= (amountToCheck ?? 1) )
    return allowance >= (amountToCheck ?? 1)
  },[coinMethods, account, setIsApproved])

  const approve = useCallback( (contractToApprove: string, approveAmount?: number ) => {
    if(!coinMethods) return
    coinMethods.approve( contractToApprove, approveAmount ?? new BigNumber(30000000000000000000000000).toFixed() )
      .send({ from: account, gasPrice: parseInt(`${new BigNumber(10).pow(10)}`)})
      .on('transactionHash', (tx) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Approve TOKEN spend`})
      })
      .on('receipt', ( rc) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        getApproved(contractToApprove)
      })
      .on('error', (error, receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        getApproved(contractToApprove)
      })
  },[coinMethods, editTransactions, account, getApproved])

  return{
    approve,
    getApproved,
    isApproved,
    coinMethods,
    web3
  }
}


export default useCoin