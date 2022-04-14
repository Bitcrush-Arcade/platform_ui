import { useState, useCallback } from 'react'
import { useWeb3React } from "@web3-react/core"
import { getContracts } from "data/contracts"
import { useContract } from "hooks/web3Hooks"
import BigNumber from 'bignumber.js'

const useCalculator = () =>
{
  const { chainId } = useWeb3React()
  const { address, abi } = getContracts('bankStaking', chainId)
  const { address: niceCompounderAddress, abi: niceCompounderABI } = getContracts('niceCompounder', chainId)
  const { address: chefAddress, abi: chefABI } = getContracts('galacticChef', chainId)
  const { methods } = useContract(abi, address)
  const { methods: compounderMethods } = useContract(niceCompounderABI, niceCompounderAddress)
  const { methods: chefMethods } = useContract(chefABI, chefAddress)

  const [ compounderReward, setCompounderReward ] = useState<BigNumber>(new BigNumber(0))
  const [ niceReward, setNiceReward ] = useState<BigNumber>(new BigNumber(0))

  const calculate = useCallback(
    async () =>
    {
      if (!methods || !chefMethods) return
      // TODO edit the niceEmissions to grab the accurate poolID
      const niceEmissions = new BigNumber(await chefMethods.getCurrentEmissions(2).call())
      const niceCompoundFee = compounderMethods ? new BigNumber(await compounderMethods.performanceFeeCompounder().call()).div(10000) : new BigNumber(0)
      const totalShares = new BigNumber(await methods.totalShares().call())

      /// NICE EMITTED
      const accNiceReward = compounderMethods ? new BigNumber(await compounderMethods.accProfitPerShare().call()).plus(niceEmissions.times(1e12).div(totalShares)) : new BigNumber(0)

      const autoLimit = parseInt(await methods.autoCompoundLimit().call())
      const startIndex = parseInt(await methods.batchStartingIndex().call())
      let addressesLength;
      try {
        addressesLength = parseInt(await methods.indexesLength().call())
      }
      catch {
        addressesLength = 0
      }
      if (!addressesLength)
        return setCompounderReward(new BigNumber(0))

      const compounderFee = parseInt(await methods.performanceFeeCompounder().call()) / 10000

      const calcLimit = startIndex + autoLimit
      const batchLimit = addressesLength <= autoLimit || calcLimit >= addressesLength
        ? addressesLength
        : calcLimit

      // CALCULATE REWARDS
      let stakeReward = new BigNumber(0)
      let niceReward = new BigNumber(0)
      for (let i = startIndex; i < batchLimit; i++) {
        const indexedAddress = await methods.addressIndexes(i).call()
        const userInfo = await methods.stakings(indexedAddress).call()
        const niceUserInfo = compounderMethods && await compounderMethods.stakings(indexedAddress).call()
        const reward = await methods.pendingReward(indexedAddress).call()
        const calcShare = new BigNumber(await methods.pendingProfits(indexedAddress).call())
        stakeReward = stakeReward.plus(reward).plus(calcShare)

        niceReward = !compounderMethods ? new BigNumber(0) : niceReward.plus(new BigNumber(userInfo.shares).times(accNiceReward).div(1e12).minus(niceUserInfo.profitBaseline))
      }
      setCompounderReward(stakeReward.times(compounderFee))
      setNiceReward(niceReward.times(niceCompoundFee))
    }
    , [ methods, setCompounderReward, chefMethods, setNiceReward, compounderMethods ])

  return { compounderReward, calculate, contractMethods: compounderMethods, niceReward }

}

export default useCalculator