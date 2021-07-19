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

type ContextType = {
  pending: TransactionHash,
  completed: TransactionHash,
  editTransactions: (id: string, type: 'pending' | 'complete' | 'error', data?: { description?: string, errorData?: any } ) => void,
  tokenInfo: { weiBalance: number , crushUsdPrice: number},
  toggleDarkMode?: () => void,
  isDark: boolean,
}

export const TransactionContext = createContext<ContextType>({
  pending: {},
  completed: {},
  editTransactions: () => {},
  tokenInfo: { weiBalance: 0, crushUsdPrice: 0 },
  toggleDarkMode: () => {},
  isDark: true
})

export const TransactionLoadingContext = (props:{ children: ReactNode })=>{
  const { children } = props
  // Blockchain Coin
  const { account, chainId } = useWeb3React()
  const token = getContracts('crushToken', chainId)
  const { methods } = useContract(token.abi, token.address )

  const [ pendingTransactions, setPendingTransactions ] = useImmer<TransactionHash>({})
  const [ completeTransactions, setCompleteTransactions ] = useImmer<TransactionHash>({})

  const [ coinInfo, setCoinInfo ] = useImmer<ContextType["tokenInfo"]>({ weiBalance: 0, crushUsdPrice: 0})
  const [hydration, setHydration] = useState<boolean>(false)
  const [ dark, setDark ] = useState<boolean>( true )

  const hydrate = () => setHydration(p => !p)

  useEffect( () => {
    async function getTokenInfo (){
      const crushPrice = await fetch('/api/getPrice').then( res => res.json() )
      if(!account || !methods) {
        setCoinInfo( draft => {
          draft.weiBalance = 0
          draft.crushUsdPrice = crushPrice?.crushUsdPrice || 0
        })
        return
      }
      const tokenBalance = await methods.balanceOf(account).call()
      setCoinInfo( draft => {
        draft.weiBalance = tokenBalance
        draft.crushUsdPrice = crushPrice?.crushUsdPrice || 0
      })
    }
    getTokenInfo()
  },[methods, account, hydration, setCoinInfo])

  useEffect( ()=>{
    const interval = setInterval( hydrate, 30000)
    return () => clearInterval(interval)
  },[])

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
    isDark: dark
  }}>
    <ThemeProvider theme={basicTheme}>
      {children}
    </ThemeProvider>
  </TransactionContext.Provider>
}

