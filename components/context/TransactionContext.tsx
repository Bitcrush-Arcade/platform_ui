// React
import { createContext, useEffect, useState, ReactNode, useMemo } from 'react'
// third party libs
import { useImmer } from 'use-immer'
import findIndex from 'lodash/findIndex'
import { useWeb3React } from '@web3-react/core'
// Material Theming
import { ThemeProvider } from '@material-ui/core/styles'
import getTheme from 'styles/BaseTheme'
// data
import { contracts } from 'data/contracts'
// hooks
import { useContract } from 'hooks/web3Hooks'

type ContextType = {
  pending: Array<string>,
  completed: Array<string>,
  error: Array<{ id: string, data: any }>,
  editTransactions: (id: string, type: 'pending' | 'complete' | 'error', errorData?: any ) => void,
  tokenInfo: { weiBalance: number , crushUsdPrice: number},
  toggleDarkMode?: () => void,
  isDark: boolean,
}

export const TransactionContext = createContext<ContextType>({
  pending: [],
  completed: [],
  error: [],
  editTransactions: () => {},
  tokenInfo: { weiBalance: 0, crushUsdPrice: 0 },
  toggleDarkMode: () => {},
  isDark: true
})

export const TransactionLoadingContext = (props:{ children: ReactNode })=>{
  const { children } = props
  // Blockchain Coin
  const { account, chainId } = useWeb3React()
  const token = contracts.crushToken
  const { methods } = useContract(token.abi, token[chainId])

  const [ pendingTransactions, setPendingTransactions ] = useImmer<Array<string>>([])
  const [ completedArray, setCompletedArray ] = useImmer<Array<string>>([])
  const [ errorArray, setErrorArray ] = useImmer<Array<{ id: string, data: any }>>([])

  const [ coinInfo, setCoinInfo ] = useImmer<ContextType["tokenInfo"]>({ weiBalance: 0, crushUsdPrice: 0})
  const [hydration, setHydration] = useState<boolean>(false)
  const [ dark, setDark ] = useState<boolean>( true )

  const hydrate = () => setHydration(p => !p)

  useEffect( () => {
    async function getTokenInfo (){
      if(!account || !methods) return
      const tokenBalance = await methods.balanceOf(account).call()
      const crushPrice = await fetch('/api/getPrice').then( res => res.json() )
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
    savedTheme && setDark( savedTheme === "true" )
  },[])

  const edits = {
    pending: (id: string, data?: any) => {
      setPendingTransactions( draft => {
        draft.push(id)
      })
    },
    complete: ( id: string, data?: any ) =>{
      setCompletedArray( draft => {
        draft.push(id)
      })
      setPendingTransactions( draft => {
        const pendingIndex = findIndex( draft, o => o == id )
        draft.splice(pendingIndex, 1)
      })
    },
    error: ( id: string, data?: any ) =>{
      setErrorArray( draft => {
        draft.push( { id: id, data: data })
      })
      setPendingTransactions( draft => {
        const pendingIndex = findIndex( draft, o => o == id )
        draft.splice(pendingIndex, 1)
      })
    },
  }

  const basicTheme = useMemo( () => getTheme(dark), [dark])

  const toggle = () => {
    setDark( p => {
      const newVal = !p
      localStorage.setItem('theme', String(newVal))
      return newVal
    } )
  }

  const editTransactions = (id: string, type: 'pending' | 'complete' | 'error', errorData?: any ) => {
    const getFn = edits[type]
    getFn(id, errorData)
  }

  return <TransactionContext.Provider value={{
    pending: pendingTransactions,
    completed: completedArray,
    error: errorArray,
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