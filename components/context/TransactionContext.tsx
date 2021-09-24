// React
import { createContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react'
// third party libs
import { useImmer } from 'use-immer'
import findIndex from 'lodash/findIndex'
import { useWeb3React } from '@web3-react/core'
// Material Theming
import { ThemeProvider } from '@material-ui/core/styles'
import getTheme from 'styles/BaseTheme'
// data
import { getContracts } from 'data/contracts'
// hooks
import { useContract } from 'hooks/web3Hooks'
// types
import { TransactionHash } from 'types/TransactionTypes'
import { servers } from 'utils/servers'
import BigNumber from 'bignumber.js'
import { toWei } from 'web3-utils'

type ContextType = {
  pending: TransactionHash,
  completed: TransactionHash,
  editTransactions: (id: string, type: 'pending' | 'complete' | 'error', data?: { description?: string, errorData?: any } ) => void,
  tokenInfo: { weiBalance: number , crushUsdPrice: number},
  liveWallet: { balance: number, timelock: number },
  toggleDarkMode?: () => void,
  isDark: boolean,
  hydrateToken: () => Promise<void>
}

export const TransactionContext = createContext<ContextType>({
  pending: {},
  completed: {},
  editTransactions: () => {},
  tokenInfo: { weiBalance: 0, crushUsdPrice: 0 },
  toggleDarkMode: () => {},
  isDark: true,
  hydrateToken: () => Promise.resolve(),
  liveWallet: { balance: 0, timelock: 0 },
})

export const TransactionLoadingContext = (props:{ children: ReactNode })=>{
  const { children } = props
  // Blockchain Coin
  const { account, chainId } = useWeb3React()
  const token = getContracts('crushToken', chainId)
  const liveWallet = getContracts('liveWallet', chainId)
  const { methods } = useContract(token.abi, token.address )
  const { methods: lwMethods } = useContract(liveWallet.abi, liveWallet.address )

  const [ pendingTransactions, setPendingTransactions ] = useImmer<TransactionHash>({})
  const [ completeTransactions, setCompleteTransactions ] = useImmer<TransactionHash>({})

  const [ coinInfo, setCoinInfo ] = useImmer<ContextType["tokenInfo"]>({ weiBalance: 0, crushUsdPrice: 0})
  const [ liveWalletBalance, setLiveWalletBalance ] = useState<ContextType["liveWallet"]>( { balance: 0, timelock: 0 } )
  const [ dark, setDark ] = useState<boolean>( true )

  const tokenHydration = useCallback( async () => {
    if(!methods || !account) return
    let serverBalance = 0
    
    const tokenBalance = await methods.balanceOf(account).call()
    const lwBalance = await lwMethods.balanceOf(account).call()
    const lwBetAmounts = await lwMethods.betAmounts( account ).call()
    const lwDuration = await lwMethods.lockPeriod().call()

    // TODO
    // COMPARE CURRENT DATE WITH TIMELOCK
    const timelockEndTime = new BigNumber(lwBetAmounts.lockTimeStamp).plus(lwDuration)
    const timelockActive = timelockEndTime.minus( new Date().getTime()/1000 ).isGreaterThan(0)
    console.log('timelockInfo', timelockActive, new Date(timelockEndTime.toNumber() * 1000))
    // IF TIMELOCK ACTIVE THEN GET BALANCE FROM SERVER
    if(timelockActive)
      await fetch(`/api/db/${account}`)
      .then( r => r.json() )
      .then( data => { 
        if(data.balancae)
          serverBalance = parseInt( data.balance ) 
        else
          serverBalance = lwBalance
      })
    // ELSE RETURN CONTRACT BALANCE
    setCoinInfo( draft => {
      draft.weiBalance = tokenBalance
    })
    setLiveWalletBalance( {
      balance: timelockActive ? serverBalance : lwBalance,
      timelock: timelockActive ? timelockEndTime.toNumber() : 0
    })
  },[methods, account, setCoinInfo, lwMethods, setLiveWalletBalance])

  const getTokenInfo = useCallback( async() => {
    const crushPrice = await fetch('/api/getPrice').then( res => res.json() )
    setCoinInfo( draft => {
      draft.crushUsdPrice = crushPrice?.crushUsdPrice || 0
    })
    tokenHydration()
  },[setCoinInfo, tokenHydration])

  useEffect( () => {
    getTokenInfo()
  },[ account, getTokenInfo ])

  useEffect( ()=>{
    const interval = setInterval( tokenHydration, 5000)
    return () => clearInterval(interval)
  },[tokenHydration])

  useEffect( () => {
    const savedTheme = window.localStorage.getItem('theme')
    setDark( savedTheme === "true" )
  },[])

  const clearPending = useCallback((id: string) => {
    setTimeout( () => setPendingTransactions(draft => { delete draft[id] }), 5000)
  },[setPendingTransactions])

  const edits = useMemo( () => ({
    pending: (id: string, data?: any) => {
      setPendingTransactions( draft => {
        draft[id] = { status: 'pending', description: data?.comment || '' }
      })
    },
    complete: ( id: string, data?: any ) =>{
      setCompleteTransactions( draft => {
        draft[id] = { 
          ...pendingTransactions[id],
          status: 'success'
        }
      })
      setPendingTransactions( draft => {
        draft[id].status = 'success'
      })
      clearPending(id)
    },
    error: ( id: string, data?: any ) =>{
      setCompleteTransactions( draft => {
        draft[id] = { 
          ...pendingTransactions[id],
          status: 'error',
          more: data || null
        }
      })
      setPendingTransactions( draft => {
        draft[id].status = 'error'
      })
      clearPending(id)
    },
  }),[setPendingTransactions, setCompleteTransactions, clearPending, pendingTransactions])

  const basicTheme = useMemo( () => getTheme(dark), [dark])

  const toggle = () => {
    setDark( p => {
      const newVal = !p
      localStorage.setItem('theme', String(newVal))
      return newVal
    } )
  }

  const editTransactions = (id: string, type: 'pending' | 'complete' | 'error', data?: { description?: string, errorData?: any } ) => {
    const getFn = edits[type]
    getFn(id, data)
  }

  return <TransactionContext.Provider value={{
    pending: pendingTransactions,
    completed: completeTransactions,
    editTransactions: editTransactions,
    tokenInfo: coinInfo,
    toggleDarkMode: toggle,
    isDark: dark,
    hydrateToken: tokenHydration,
    liveWallet: liveWalletBalance
  }}>
    <ThemeProvider theme={basicTheme}>
      {children}
    </ThemeProvider>
  </TransactionContext.Provider>
}

