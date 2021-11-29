import { useState, useCallback } from 'react'
import { useWeb3React } from "@web3-react/core"
import { getContracts } from "data/contracts"
import { useContract } from "hooks/web3Hooks"
import BigNumber from 'bignumber.js'

const useCalculator = () => {
  const { chainId } = useWeb3React()
  const { address, abi } = getContracts('bankStaking', chainId)
  const { methods } = useContract(abi, address)

  const [ compounderReward, setCompounderReward ] = useState<BigNumber>( new BigNumber(0))

  const calculate = useCallback (
    async () => {
      if(!methods) return
      const autoLimit = parseInt( await methods.autoCompoundLimit().call() )
      const startIndex = parseInt( await methods.batchStartingIndex().call() )
      let addressesLength 
      try {
        addressesLength = parseInt( await methods.indexesLength().call() )
      }
      catch{
        addressesLength = 0
      }
      if(!addressesLength)
        return setCompounderReward( new BigNumber(0) )
      
      const compounderFee = parseInt( await methods.performanceFeeCompounder().call()) / 10000

      const calcLimit = startIndex + autoLimit
      const batchLimit = addressesLength <= autoLimit || calcLimit >= addressesLength
      ? addressesLength
      : calcLimit
      
      // CALCULATE REWARDS
      let stakeReward = new BigNumber(0)
      for( let i = startIndex; i < batchLimit; i++){
        const indexedAddress = await methods.addressIndexes( i ).call()
        const reward = await methods.pendingReward( indexedAddress ).call()
        const calcShare = new BigNumber( await methods.pendingProfits( indexedAddress ).call() )
        stakeReward = stakeReward.plus( reward ).plus( calcShare )
      }
      setCompounderReward( stakeReward.times(compounderFee) )
    }
  ,[methods, setCompounderReward])

  return { compounderReward, calculate, contractMethods: methods }
  
}

export default useCalculator