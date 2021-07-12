// State
import { useState, useEffect, useCallback, useMemo } from 'react'
// Web3
import Web3 from 'web3'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

const validChains = [56,97]
// Login and Logout Hook -> Handles Wallet Connection
export const useAuth = () => {

  
  const { activate, deactivate, account } = useWeb3React()
  
  const login = useCallback(() => {
    const connector = new InjectedConnector({ supportedChainIds: validChains})
    if(connector)
      activate(connector, async(error) =>{
        console.log('failed activation',error)
      })
      .then( () => window.localStorage.setItem('connectorId', 'injected'))
  },[activate])

  return { login, logout: deactivate, account }
}
// Automatically try to login if use has previously logged in
export const useEagerConnect = () => {

  const { login } = useAuth()
  
  useEffect(()=>{
    
    const connector = window.localStorage.getItem('connectorId')
    if(!connector) return
    login()

  }, [login])
}

const web3 = new Web3(Web3.givenProvider)

// easy import of a contract to interact with
export function useContract(abi: any, address: string): ContractHandles{
  const { chainId } = useWeb3React()
  const [contract, setContract] = useState(() => [56, 97].indexOf(chainId || 0)> -1 && address ? new web3.eth.Contract(abi,address) : null)
  
  useEffect( () => {
    chainId && setContract( () => [56, 97].indexOf(chainId || 0)> -1 && address ? new web3.eth.Contract(abi,address) : null )
  },[chainId,abi,address])
  
  return { contract, methods: contract?.methods || null, web3 }
}

type ContractHandles = {
  contract: any,
  methods: any,
  web3: Web3,
}

const ContractNames = {
  "injected": new InjectedConnector({ supportedChainIds: validChains}),
  "walletConnect" : new 
}