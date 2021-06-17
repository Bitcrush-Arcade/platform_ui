import { createContext, } from 'react'
import { useImmer } from 'use-immer'

import findIndex from 'lodash/findIndex'

type ContextType = {
  pending: Array<string>,
  completed: Array<string>,
  error: Array<{ id: string, data: any }>,
  editTransactions: (id: string, type: 'pending' | 'complete' | 'error', errorData?: any ) => void
}

export const TransactionContext = createContext<ContextType>({
  pending: [],
  completed: [],
  error: [],
  editTransactions: () => {}
})

export const TransactionLoadingContext = ({ children })=>{

  const [ pendingTransactions, setPendingTransactions ] = useImmer<Array<string>>([])
  const [ completedArray, setCompletedArray ] = useImmer<Array<string>>([])
  const [ errorArray, setErrorArray ] = useImmer<Array<{ id: string, data: any }>>([])

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

  const editTransactions = (id: string, type: 'pending' | 'complete' | 'error', errorData?: any ) => {
    const getFn = edits[type]
    getFn(id, errorData)
  }

  return <TransactionContext.Provider value={{
    pending: pendingTransactions,
    completed: completedArray,
    error: errorArray,
    editTransactions: editTransactions
  }}>
    {children}
  </TransactionContext.Provider>
}