import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useAuth } from './web3Hooks'


export function useWithWallet<T>(options:walletOptions<T>) {
  const { account } = useWeb3React()
  const { login } = useAuth()

  const action = useCallback(
    (e) => {
      if(account)
        options.action(e)
      else 
        login()
    },
    [options.action, account]
  )

  return {
    action
  }
}

type walletOptions<T> ={
  action: (e:T) => void,
}