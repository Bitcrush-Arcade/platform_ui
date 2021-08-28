import { useCallback, useEffect } from 'react'
// ThirdParty
import { useWeb3React } from '@web3-react/core'
import { useImmer } from 'use-immer'
// HOOKS
import { useContract } from 'hooks/web3Hooks'
import { getContracts } from 'data/contracts'
import BigNumber from 'bignumber.js'

function useBank(){
  // Get connection
  const { chainId, account } = useWeb3React()
  const [ bankContract, stakingContract ] = [ getContracts( 'bankroll', chainId ), getContracts( 'bankStaking', chainId )]
  const { methods: bankMethods } = useContract( bankContract.abi, bankContract.address )
  const { methods: stakingMethods } = useContract( stakingContract.abi, stakingContract.address )

  const [ bankInfo, setBankInfo ] = useImmer<BankInfo>(initBank)
  const [ userInfo, setUserInfo ] = useImmer<UserInfo>(initUser)

  // GET BANK DATA
  const getBankData = useCallback( async() => {
    if(!bankMethods) return
    const totalBankroll = await bankMethods.totalBankroll().call()
    const availableProfit = await bankMethods.availableProfit().call()
    const profitThreshold = await bankMethods.profitThreshold().call()
    setBankInfo( draft => {
      draft.totalBankroll = +totalBankroll
      draft.profitThreshold = +profitThreshold
      draft.availableProfit = +availableProfit
      draft.thresholdPercent = parseFloat( new BigNumber(availableProfit).div( new BigNumber(profitThreshold) ).times(100).toFixed(2) )
    })
  },[bankMethods, setBankInfo])

  useEffect( () => {
    if(!bankMethods) return
    getBankData()
  },[getBankData, bankMethods])

  // GET STAKING DATA

  const getStakingData = useCallback( async() => {
      if(!stakingMethods) return
      const totalStaked = await stakingMethods.totalStaked().call()
      let profits:{ total: number, remaining: number} = { total: 0, remaining: 0}
      await stakingMethods.profits(0).call({}, (err, result) => {
        if(err) return
        profits = result
      })
      .catch( e => console.log('error2', e))
      setBankInfo(draft => {
        draft.totalStaked = +totalStaked
        draft.profitTotal = profits
      })
      
      if(!account) return
      const userRewards = await stakingMethods.pendingReward(account).call()
      const currentStaked = await stakingMethods.stakings(account).call()

      setUserInfo( draft => {
        draft.stakingReward = +userRewards
        draft.staked = +currentStaked.stakedAmount
        draft.stakePercent = (+currentStaked.stakedAmount)/(+totalStaked || 1) * 100
        draft.edgeReward = 0
      })

    },[stakingMethods, setUserInfo, setBankInfo, account],
  )

  useEffect( () => {
    if(!stakingMethods) return
    getStakingData()
  },[getStakingData, stakingMethods])

  // REFETCH DATA EVERY 12 SECONDS
  const hydrateData = useCallback( () => {
    getBankData()
    getStakingData()
  },[getBankData, getStakingData])

  useEffect(() => {
    const interval = setInterval( hydrateData, 12000)
    return () => clearInterval( interval )
  },[hydrateData])


  return { 
    bankInfo,
    userInfo,
    hydrateData,
    addresses:{
      bank: bankContract.address,
      staking: bankContract.address
    },
    bankMethods,
    stakingMethods,
  }
}

export default useBank

type BankInfo = {
  totalBankroll: number,
  totalStaked: number,
  availableProfit: number,
  profitThreshold: number,
  profitTotal: { total: number, remaining: number },
  profitDistribution: number,
  thresholdPercent: number,
}
const initBank: BankInfo = {
  totalBankroll: 0,
  totalStaked: 0,
  availableProfit: 0,
  profitThreshold: 0,
  profitTotal: {
    total: 0,
    remaining: 0
  },
  profitDistribution: 0.6,
  thresholdPercent: 0,
}
type UserInfo = {
  staked: number,
  stakingReward: number,
  edgeReward: number,
  stakePercent: number,
}

const initUser: UserInfo ={
  staked: 0,
  stakingReward: 0,
  edgeReward: 0,
  stakePercent: 0
}