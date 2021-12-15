import { useState, useCallback, useEffect} from 'react'
import { useContract } from 'hooks/web3Hooks'
import { getContracts } from 'data/contracts'
import { useTransactionContext } from 'hooks/contextHooks'
import BigNumber from 'bignumber.js'
// Types
import { Receipt } from 'types/PromiEvent'

const usePrevLiveWallet = (data: { account?: string | null, chainId?:number }) => {
  const {account, chainId} = data
  const { editTransactions } = useTransactionContext()
  //---------------------------------------------------------------
  // Temporary PREV LIVEWALLET FIX
  //---------------------------------------------------------------

  const [ prevLwData, setPrevLwData ] = useState<{ funds?: string, hasFunds?: boolean }>({})
  const { address: prevLwAdd, abi: prevLWAbi } = getContracts('prevLw', chainId)
  const { methods: prevLwMethods } = useContract(prevLWAbi, prevLwAdd)


  const getPrevData = useCallback( async () => {
    if(!prevLwMethods || !account) return
    const funds = await prevLwMethods.balanceOf(account).call()
    const fundBig = new BigNumber(funds)
    setPrevLwData({
      funds: fundBig.toString(),
      hasFunds: fundBig.isGreaterThan( 0 )
    })
  }, [prevLwMethods, account, setPrevLwData])

  useEffect(() =>{
    if(!prevLwMethods || !account) return
    const interval = setInterval( () => getPrevData(), 10000 )
    return () => clearInterval(interval)
  },[prevLwMethods, account])

  const withdrawV1 = useCallback( () => {
    if(!prevLwMethods || !account || !prevLwData.hasFunds ) return console.log('nothing to do here')
    prevLwMethods.withdrawBet( prevLwData.funds ).send({ from: account })
    .on('transactionHash', (tx: string) => {
      console.log('hash', tx )
      editTransactions(tx,'pending', { description: `Withdraw from V1 LiveWallet`})
    })
    .on('receipt', ( rc: Receipt) => {
      console.log('receipt',rc)
      editTransactions(rc.transactionHash,'complete')
      getPrevData()
    })
    .on('error', (error: any, receipt:Receipt) => {
      console.log('error', error, receipt)
      receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
    })

  },[ prevLwMethods, account, prevLwData, getPrevData, editTransactions])

  return {
    balance: prevLwData.funds,
    hasFunds: prevLwData.hasFunds,
    withdrawAll: withdrawV1,
  }
}

export default usePrevLiveWallet