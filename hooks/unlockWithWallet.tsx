import { useWeb3React } from '@web3-react/core'


export function useWithWallet<T>(options:walletOptions<T>) {
  const { account } = useWeb3React()

  const action = account
    ? options.action
    : console.log('no wallet yet do something')

  return action
}

type walletOptions<T> ={
  action: (e:T) => void,
}