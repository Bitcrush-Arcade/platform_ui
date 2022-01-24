// React
import { createContext, ReactNode, useState, useMemo, useCallback, useEffect } from 'react'
import { useImmer } from 'use-immer'
import BigNumber from 'bignumber.js'
import { AbiItem } from 'web3-utils'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
// Material
import Typography from '@mui/material/Typography'
// BitcrushUI
import { useTransactionContext } from 'hooks/contextHooks'
import LiveWalletSelectModal from 'components/displays/LiveWalletSelectModal'
import StakeModal, { StakeOptionsType, SubmitFunction } from "components/basics/StakeModal"
// Data
import { liveWalletsQuery as walletsQuery } from 'queries/livewallets'
import { client } from 'utils/sanityConfig'
// Utils
import { differenceFromNow } from 'utils/dateFormat'
// Types
import { Wallet } from 'types/liveWallets'
import { useWeb3React } from '@web3-react/core'
// ABI
import LiveWallet from 'abi/BitcrushLiveWallet.json'
import Token from 'abi/CrushToken.json'

type ContextType = {
  selectedWallet: Wallet | null,
  allWallets: Array<Wallet>,
  selectWallet: (currency: string) => void
  toggleStakeModal: () => void,
  toggleSelectModal: () => void,
}

export const LiveWalletContext = createContext<ContextType>({
  selectedWallet: null,
  allWallets: [],
  selectWallet: () => {},
  toggleSelectModal: () => {},
  toggleStakeModal: () => {}
})

export const LiveWalletsContext = (props: { children: ReactNode }) => {
  const { account, chainId } = useWeb3React()
  const { tokenInfo, liveWallet, toggleLwModal, web3, editTransactions } = useTransactionContext()
  const [ usedWallet, setUsedWallet ] = useState<string>('CRUSH')
  const [ allWallets, setAllWallets ] = useImmer<Array<Wallet>>([])
  const [ openSelect, setOpenSelect ] = useState<boolean>(false)
  const [ openStake, setOpenStake ] = useState<boolean>(false)

  const getAllWallets = useCallback( async() => {
    const data = await client.fetch(walletsQuery)
    setAllWallets(data)
  },[ setAllWallets ])

  useEffect( () => {
    getAllWallets()
  },[getAllWallets])

  const getWalletBalances = useCallback( async () => {
    if(!web3 || !account) return
    const balances: Array<{lwBalance: string, currentWallet: string, timelock: string, timelockActive: boolean}> = []
    for( let i = 0; i < allWallets.length; i++){
      const usedAddress = allWallets[i].walletContract && (chainId === allWallets[i].walletContract.mainChain &&  allWallets[i].walletContract.mainAddress || chainId === allWallets[i].walletContract.testChain && allWallets[i].walletContract.testAddress) || null
      const usedTokenAddress = chainId === allWallets[i].tokenName.tokenContract.mainChain &&  allWallets[i].tokenName.tokenContract.mainAddress || chainId === allWallets[i].tokenName.tokenContract.testChain && allWallets[i].tokenName.tokenContract.testAddress || null
      const item = { lwBalance:'0', currentWallet:'0', timelock: '0', timelockActive: false }
      if(usedAddress){
        const walletContract = await new web3.eth.Contract(LiveWallet.abi as AbiItem[], usedAddress)
        item.lwBalance = new BigNumber(await walletContract.methods.balanceOf(account).call()).div(10**18).toString()
        const lwTimelock = await walletContract.methods.betAmounts(account).call()
        const timelock = new BigNumber(await walletContract.methods.lockPeriod().call()).plus(lwTimelock)
        item.timelock = timelock.toString()
        item.timelockActive = timelock.minus(new Date().getTime()/1000).isGreaterThan(0)
      }
      else{
        item.lwBalance = 'N/A',
        item.timelock = '0'
      }
      if(usedTokenAddress){
        const tokenContract = await new web3.eth.Contract(Token.abi as AbiItem[], usedTokenAddress)
        item.currentWallet = new BigNumber(await tokenContract.methods.balanceOf(account).call()).div(10**18).toString()
      }
      else
        item.currentWallet = '0'
      balances.push(item)
    }
    setAllWallets( draft => {
      for(let j = 0; j < draft.length; j++){
        draft[j].balance = balances[j].lwBalance
        draft[j].walletBalance = balances[j].currentWallet
        draft[j].timelock = balances[j].timelock
        draft[j].isTimelockActive = balances[j].timelockActive
      }
    })

  },[allWallets, setAllWallets, web3, chainId, account])

  useEffect( () => {
    if(!allWallets.length) return

    const interval = setInterval(getWalletBalances, 5000)
    return () => {
      clearInterval(interval)
    }
  },[getWalletBalances, allWallets])

  useEffect( () => {
    const prevSelected = localStorage.getItem('lwUsed')
    if(!prevSelected || prevSelected ==='CRUSH')
      return
    setUsedWallet(prevSelected)
  },[ setUsedWallet ])

  const selectedWallet= useMemo(()=>{
    return find(allWallets, wallet => wallet.symbolToken === usedWallet) || null
  },[allWallets, usedWallet])

  const selectWallet = useCallback( (symbol: string) => {
    localStorage.setItem('lwUsed', symbol)
    setUsedWallet(symbol)
  },[setUsedWallet])

  const toggleSelectModal = useCallback( () => {
    setOpenSelect(p => !p)
  },[setOpenSelect])

  const toggleStakeModal = useCallback( ()=>{
    setOpenStake( p => !p)
  },[setOpenStake])

  const timelockInPlace = new BigNumber(selectedWallet?.timelock || '0').isGreaterThan( new Date().getTime()/1000 )

  const withdrawDetails = () => {
    return timelockInPlace ? <>
          <Typography variant="caption" component="div" style={{ marginTop: 16, letterSpacing: 1.5}} align="justify" >
            0.5% early withdraw fee if withdrawn before { differenceFromNow( new BigNumber(selectedWallet?.timelock || '0').times(1000).toNumber() ) }.
            <br/>
            {selectedWallet?.isTimelockActive && <>
              {"Withdraws are disabled for 90 seconds after gameplay, please try again shortly."}
              </>
            }
          </Typography>
        </>
        : <></>
  }

  // LiveWallet Options
  const lwOptions: Array<StakeOptionsType> = [
    { 
      name: 'Add Funds',
      description: 'Add Funds to Live Wallet from CRUSH',
      btnText: 'Wallet CRUSH',
      maxValue: tokenInfo.weiBalance
    },
    { 
      name: 'Withdraw Funds',
      description: 'Withdraw funds from Live Wallet to CRUSH',
      btnText: 'Live Wallet CRUSH',
      maxValue: selectedWallet && selectedWallet.balance && new BigNumber(selectedWallet.balance) || 0,
      onSelectOption: () => getWalletBalances(),
      disableAction: timelockInPlace && selectedWallet?.isTimelockActive || false,
      more: withdrawDetails
    },
  ]

  const stakeModalActionSelected = useCallback(async ( action: number)=> {
    if(!usedWallet) return false
    const quickWithdrawLock = await fetch(`/api/db/play_timelock_active`,{
        method: "POST",
        body: JSON.stringify({
          account: account
        })
      })
      .then( r =>  r.json() )
      .then( d => {
        if(d.error)
          return true
        return d?.lockWithdraw || false
      })
      .catch( e => {
        return 'Error'
    })
    console.log({ quickWithdrawLock })
    if(typeof(quickWithdrawLock) == 'string') return true
    setAllWallets( draft => {
      const index = findIndex(draft, o => o.symbolToken === usedWallet)
      draft[index].isTimelockActive = quickWithdrawLock
    })

  },[setAllWallets, usedWallet, account])

  const lwSubmit: SubmitFunction = ( values, form ) => {
    console.log('does submit')
    if(!liveWalletMethods || !account) return form.setSubmitting(false)
    const weiValue = toWei(`${new BigNumber(values.stakeAmount).toFixed(18,1)}`)
    if(!values.actionType){
      return liveWalletMethods.addbet( weiValue )
        .send({ from: account })
        .on('transactionHash', (tx: string) => {
          console.log('hash', tx )
          editTransactions(tx,'pending', { description: `Add Funds to Live Wallet`})
          toggleLwModal()
        })
        .on('receipt', ( rc: Receipt ) => {
          console.log('receipt',rc)
          editTransactions(rc.transactionHash,'complete')
          fetch('/api/db/deposit',{ 
            method: 'POST',
            body: JSON.stringify({ 
              account: account,
              amount: values.stakeAmount.toString(),
              negative: false,
            })
          })
            .then( r => r.json())
            .then( c => console.log('response',c))
            .catch(e => console.log(e))
          hydrateToken()
          form.setSubmitting(false)
        })
        .on('error', (error: any, receipt: Receipt) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
          hydrateToken()
          form.setSubmitting(false)
        })
        
    }
    else if(timelockInPlace){
      toggleLwModal()
      const signMessage = web3.utils.toHex("I agree to withdraw early from Livewallet "+values.stakeAmount+" and pay the early withdraw fee")
      return web3.eth.personal.sign( signMessage, account, "",
        (e,signature) => {
          if(e) return
          fetch('/api/withdrawForUser',{
            method: 'POST',
            body: JSON.stringify({
              chain: chainId,
              account: account,
              amount: weiValue,
            })
          })
          .then( response => response.json())
          .then( data => {
            // check if gameplay has happened in the past minute
            if( data.timelock ){
              editTransactions('withdrawError','pending', { comment: 'Withdrawals are delayed for 90 seconds after gameplay ends. Please try again shortly'});
              setTimeout(() => {
                editTransactions('withdrawError', 'error',{ errorData: 'Withdrawals are delayed for 90 seconds after gameplay ends. Please try again shortly'})
              },3000)
              return
            }
            if(data.txHash) {
              editTransactions( data.txHash, 'pending', {  description: 'Withdraw for User from LiveWallet', needsReview: true});
              setWfuCalled({ hash: data.txHash, amount: values.stakeAmount.toString()})
            }
            else{
              editTransactions( 'Err........or..', 'pending', {errorData: data.error})
              setTimeout(
                () => editTransactions('Err........or..', 'error', { errorData: data.error})
                , 3000
              )
            }
          })
          .finally(() => form.setSubmitting(false))
        }
        )
      
    }
    return liveWalletMethods.withdrawBet( weiValue )
      .send({ from: account })
      .on('transactionHash', (tx: string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Withdraw Funds from LiveWallet`})
        toggleLwModal()
      })
      .on('receipt', ( rc: Receipt ) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        hydrateToken()
        fetch('/api/db/deposit',{ 
          method: 'POST',
          body: JSON.stringify({ 
            account: account,
            amount: values.stakeAmount.toString(),
            negative: true,
          })
        })
          .then( r => r.json())
          .then( c => console.log('response',c))
          .catch(e => console.log(e))
          .finally( () => form.setSubmitting(false))
      })
      .on('error', (error: any, receipt: Receipt ) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        form.setSubmitting(false)
      })
  }

  return <LiveWalletContext.Provider value={{
    selectedWallet,
    allWallets,
    selectWallet,
    toggleSelectModal,
    toggleStakeModal
  }}>
    {props.children}
    <LiveWalletSelectModal open={openSelect} onClose={toggleSelectModal} wallets={allWallets} onWalletSelected={selectWallet} />
    <StakeModal
      open={openStake}
      onClose={toggleStakeModal}
      options={lwOptions}
      onSubmit={lwSubmit}
      needsApprove={ !isApproved }
      onApprove={ () => approve(liveWallet.address) }
      coinInfo={{
        symbol: 'CRUSH',
        name: 'Crush Coin',
        decimals: 18
      }}
      onActionSelected={stakeModalActionSelected}
    />
  </LiveWalletContext.Provider>
}