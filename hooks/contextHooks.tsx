import { useContext } from 'react'
import { TransactionContext } from 'components/context/TransactionContext'

export function useTransactionContext(){
  const context = useContext(TransactionContext)

  return context
}