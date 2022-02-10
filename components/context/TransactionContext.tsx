// React
import { createContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
// third party libs
import { useImmer } from 'use-immer'
import { useWeb3React } from '@web3-react/core'
// Material Theming
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import getTheme from 'styles/BaseTheme'
// data
import { getContracts } from 'data/contracts'
// hooks
import { useContract } from 'hooks/web3Hooks'
// types
import { TransactionHash } from 'types/TransactionTypes'
import { Receipt } from 'types/PromiEvent';
import BigNumber from 'bignumber.js'
import type Web3 from 'web3'

type TransactionSubmitData = { 
  description?: string,
  errorData?: any,
  needsReview?: boolean,
  comment?: string,
}

type ContextType = {
  pending: TransactionHash,
  completed: TransactionHash,
  editTransactions: (id: string, type: 'pending' | 'complete' | 'error', data?: TransactionSubmitData ) => void,
  tokenInfo: { weiBalance: BigNumber , crushUsdPrice: number, burned: number},
  liveWallet: { balance: BigNumber, timelock: number, selfBlacklist: () => void },
  toggleDarkMode?: () => void,
  isDark: boolean,
  hydrateToken: (reset?:boolean) => Promise<void>,
  toggleLwModal: () => void,
  lwModalStatus: boolean,
  web3: Web3 | null
}

export const TransactionContext = createContext<ContextType>({
  pending: {},
  completed: {},
  editTransactions: () => {},
  tokenInfo: { weiBalance: new BigNumber(0), crushUsdPrice: 0, burned: 0},
  toggleDarkMode: () => {},
  isDark: true,
  hydrateToken: (reset?:boolean) => Promise.resolve(),
  liveWallet: { balance: new BigNumber(0), timelock: 0, selfBlacklist: () => {} },
  toggleLwModal: () => {},
  lwModalStatus: false,
  web3: null
})

export const TransactionLoadingContext = (props:{ children: ReactNode, emotionCache: EmotionCache })=>{
  const { children, emotionCache } = props
  // Blockchain Coin
  const { account, chainId } = useWeb3React()
  const router = useRouter()
  const token = getContracts('crushToken', chainId)
  const liveWallet = getContracts('liveWallet', chainId)

  const { methods, web3 } = useContract(token.abi, token.address )
  const { methods: lwMethods } = useContract(liveWallet.abi, liveWallet.address )

  const [ pendingTransactions, setPendingTransactions ] = useImmer<TransactionHash>({})
  const [ completeTransactions, setCompleteTransactions ] = useImmer<TransactionHash>({})

  const [ coinInfo, setCoinInfo ] = useImmer<ContextType["tokenInfo"]>({ weiBalance:  new BigNumber(0), crushUsdPrice: 0, burned: 0})
  const [ liveWalletBalance, setLiveWalletBalance ] = useState<ContextType["liveWallet"]>( { balance: new BigNumber(0), timelock: 0, selfBlacklist: () => {} } )
  const [ dark, setDark ] = useState<boolean>( true )
  const [ lwModal, setLwModal ] = useState<boolean>( false )

  const [reviewHash, setReviewHash] = useImmer<{ intervalId: any, hashArray: Array<string>}>({ intervalId: null, hashArray: []})

  const toggleLwModal = useCallback( () => setLwModal( p => !p), [setLwModal])

  const tokenHydration = useCallback( async (reset?:boolean) => {
    if(reset){
      setLiveWalletBalance( prev => ({...prev, balance: new BigNumber(0)}))
    }
    let serverBalance = 0
    
    const tokenBalance = account && methods ? await methods.balanceOf(account).call() : '0'
    const totalBurned = methods ? await methods.tokensBurned().call() : '0'
    const lwBalance = parseInt( (account && lwMethods) ? await lwMethods.balanceOf(account).call() : '0')
    const lwBetAmounts = lwMethods && account ? await lwMethods.betAmounts( account ).call() : { lockTimeStamp: 0 }
    const lwDuration = lwMethods ? await lwMethods.lockPeriod().call() : '0'

    // COMPARE CURRENT DATE WITH TIMELOCK
    const timelockEndTime = new BigNumber(lwBetAmounts.lockTimeStamp).plus(lwDuration)
    const timelockActive = timelockEndTime.minus( new Date().getTime()/1000 ).isGreaterThan(0)
    // IF TIMELOCK ACTIVE THEN GET BALANCE FROM SERVER
    if(timelockActive)
      await fetch(`/api/db/${account}`)
      .then( r => r.json() )
      .then( data => { 
        if(data.balance)
          serverBalance = parseInt( data.balance ) 
        else
          serverBalance = lwBalance
      })
      .catch( e =>{
        console.log('error fetching db balance', e)
        serverBalance = -1
      })
    // ELSE RETURN CONTRACT BALANCE
    setCoinInfo( draft => {
      draft.weiBalance = new BigNumber(tokenBalance)
      draft.burned = new BigNumber(totalBurned).div( 10**18 ).toNumber()
    })
    setLiveWalletBalance( prev => {
      const timelock = timelockActive ? timelockEndTime.toNumber() : 0
      return { ...prev,
        timelock,
        balance: new BigNumber(timelockActive ? (serverBalance > -1 ? serverBalance : prev.balance ) : lwBalance)
      }
    })
  },[methods, account, setCoinInfo, lwMethods, setLiveWalletBalance])

  const getTokenInfo = useCallback( async() => {
    const crushPrice = await fetch('/api/getPrice').then( res => res.json() )
    setCoinInfo( draft => {
      draft.crushUsdPrice = +crushPrice?.crushUsdPrice || 0
    })
    tokenHydration()
  },[setCoinInfo, tokenHydration])
  // Get Token Info
  useEffect( () => {
    const interval = setInterval(getTokenInfo, 10000)
    return () => clearInterval(interval)
  },[ account, getTokenInfo ])
  // Refetch Token and Wallet Info
  useEffect( ()=>{
    const interval = setInterval( tokenHydration, 5000)
    return () => clearInterval(interval)
  },[tokenHydration, router])
  // set Current Theme
  useEffect( () => {
    const savedTheme = window.localStorage.getItem('theme')
    setDark( savedTheme === "true" )
  },[])

  const clearPending = useCallback((id: string) => {
    setTimeout( () => setPendingTransactions(draft => { delete draft[id] }), 5000)
  },[setPendingTransactions])

  const edits = useMemo( () => ({
    pending: (id: string, data?: TransactionSubmitData) => {
      setPendingTransactions( draft => {
        draft[id] = { status: 'pending', description: data?.description || data?.comment || '', errorMsg: data?.errorData }
        if(data?.needsReview)
        setReviewHash( draft => { draft.hashArray.push(id) })
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
        if(!draft[id]) return
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
        if(!draft[id]) return
        draft[id].status = 'error'
      })
      clearPending(id)
    },
  }),[setPendingTransactions, setCompleteTransactions, clearPending, pendingTransactions, setReviewHash])

  const editTransactions = useCallback( (id: string, type: 'pending' | 'complete' | 'error', data?: TransactionSubmitData ) => {
    const getFn = edits[type]
    getFn(id, data)
  },[edits])

  const checkTransactions = useCallback( (hashArray: Array<string>) => {
    const recheckArr: string[] =  []
    hashArray.map( async (hash, index) => {

      if(pendingTransactions[hash]?.status !== 'pending') return
      console.log( 'toCheck', pendingTransactions[hash] )
      
      await web3.eth.getTransactionReceipt( hash, ( e, rc) => {
        console.log( 'check response', {e, rc})
        if( !rc || !pendingTransactions[hash]) return recheckArr.push(hash)
        pendingTransactions[hash] && editTransactions( hash, rc.status ? 'complete' : 'error')
        setReviewHash( draft => {
          draft.hashArray.splice(index, 1)
        })
      })
    })
    if(recheckArr.length > 0){
      setTimeout( () => checkTransactions( recheckArr), 5000 )
    }
  },[ web3, setReviewHash, editTransactions, pendingTransactions])

  // Review Hashes
  useEffect( () => {
    if( reviewHash.hashArray.length == 0 ) return
    setTimeout(() => checkTransactions( reviewHash.hashArray ), 5000)
    
  },[reviewHash, setReviewHash, checkTransactions])

  const basicTheme = useMemo( () => getTheme(dark), [dark])

  const toggle = () => {
    setDark( p => {
      const newVal = !p
      localStorage.setItem('theme', String(newVal))
      return newVal
    } )
  }

  const selfBlacklist = useCallback(() => {
    lwMethods.blacklistSelf().send({ from: account })
      .on('transactionHash', (tx: string) => {
        editTransactions(tx, 'pending', { description: "Self Blacklist"})
      })
      .on('receipt', ( rc: Receipt) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
      })
      .on('error', (error: any, receipt:Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  }, [ lwMethods, account, editTransactions])

  return (<CacheProvider value={emotionCache}>
    <TransactionContext.Provider value={{
      pending: pendingTransactions,
      completed: completeTransactions,
      editTransactions: editTransactions,
      tokenInfo: coinInfo,
      toggleDarkMode: toggle,
      isDark: dark,
      hydrateToken: tokenHydration,
      liveWallet: { ...liveWalletBalance, selfBlacklist },
      toggleLwModal,
      lwModalStatus: lwModal,
      web3
    }}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={basicTheme}>
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </TransactionContext.Provider>
  </CacheProvider>
  );
}

