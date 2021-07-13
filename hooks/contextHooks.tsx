import { useContext } from 'react'
import { TransactionContext } from 'components/context/TransactionContext'
import { Context as AuthContext } from 'components/context/AuthContext'

export function useTransactionContext(){
  const context = useContext(TransactionContext)

  return context
}

export function useAuthContext(){
  const context = useContext(AuthContext)
  return context
}