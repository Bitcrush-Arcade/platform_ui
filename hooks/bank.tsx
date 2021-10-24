import { useCallback, useEffect } from 'react'
// ThirdParty
import { useWeb3React } from '@web3-react/core'
import { useImmer } from 'use-immer'
// HOOKS
import { useContract } from 'hooks/web3Hooks'
import { getContracts } from 'data/contracts'
import BigNumber from 'bignumber.js'
// Types
import { RoiProps } from 'components/pools/RoiModal'

function useBank(){
  // Get connection
  const { chainId, account } = useWeb3React()
  const [ bankContract, stakingContract ] = [ getContracts( 'bankroll', chainId ), getContracts( 'bankStaking', chainId )]
  const { methods: bankMethods } = useContract( bankContract.abi, bankContract.address )
  const { methods: stakingMethods } = useContract( stakingContract.abi, stakingContract.address )

  const [ bankInfo, setBankInfo ] = useImmer<BankInfo>(initBank)
  const [ userInfo, setUserInfo ] = useImmer<UserInfo>(initUser)

  const getApyData = () => {
    if(!chainId) return
    fetch('/api/bankAPY',{
      method: 'POST',
      body: JSON.stringify({
        chainId: chainId || 56,
      })
    })
      .then( response => response.json() )
      .then( data => setBankInfo( draft => {
        draft.apyPercent = data.compoundRewards
      }))
  }

  useEffect( () => { getApyData() }, [chainId])

  // GET BANK DATA
const getBankData = useCallback( async() => {
    if(!bankMethods) return
    const totalBankroll = await bankMethods.totalBankroll().call()
    const availableProfit = await bankMethods.brSinceCompound().call()
    const negativeProfit = await bankMethods.negativeBrSinceCompound().call()
    const profitThreshold = await bankMethods.profitThreshold().call()
    const totalProfit = await bankMethods.totalProfit().call()
    const profitShare = await bankMethods.profitShare().call()
    const divisor = await bankMethods.DIVISOR().call()
    const sharePercent = new BigNumber( profitShare ).div( divisor )
    const calculatedProfit = new BigNumber(availableProfit).times( sharePercent ).minus(negativeProfit).toNumber()
    setBankInfo( draft => {
      draft.totalBankroll = +totalBankroll
      draft.profitThreshold = +profitThreshold
      draft.availableProfit =  calculatedProfit
      draft.thresholdPercent = calculatedProfit >= 0 ? new BigNumber(calculatedProfit).times(100).div(profitThreshold).toNumber(): 0
      draft.bankDistributed = +totalProfit
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
      const totalFrozen = await stakingMethods.totalFrozen().call()
      const distributedProfit = await stakingMethods.totalProfitDistributed().call()
      const totalClaimed = await stakingMethods.totalClaimed().call()
      const pendingStaked = await stakingMethods.pendingStakedValue().call()
      const batchIndex = await stakingMethods.batchStartingIndex().call()
      let poolStart 
      try{
        poolStart = await stakingMethods.deploymentTimeStamp().call()
      }
      catch{
        poolStart = new Date().getTime()/1000 - (20*24*3600)
      }

      let profits:{ total: number, remaining: number} | null = null
      await stakingMethods.profits(0).call({}, (err, result) => {
        if(err) return
        profits = result
      })
      .catch( e => console.log('profits[0] returns null'))
      
      
      setBankInfo(draft => {
        draft.totalFrozen = new BigNumber( totalFrozen ).toNumber()
        draft.totalStaked = new BigNumber(totalStaked).minus( totalFrozen ).toNumber()
        draft.pendingStaked = new BigNumber( pendingStaked ).toNumber()
        draft.profitTotal = { total: +profits.total, remaining: +profits.remaining}
        draft.stakingDistruted = new BigNumber( distributedProfit ).plus( totalClaimed ).toNumber()
        draft.poolStart = new Date( parseInt(poolStart) * 1000 )
      })
      
      if(!account) return
      const userRewards = await stakingMethods.pendingReward(account).call()
      const currentStaked = await stakingMethods.stakings(account).call()
      const totalStakedVerified = (+totalStaked || 1) + ( +currentStaked.index > (+batchIndex) ? +pendingStaked : 0 )
      const stakedPercent = (+currentStaked.stakedAmount)/( totalStakedVerified )
      setUserInfo( draft => {
        draft.stakingReward = +userRewards
        draft.staked = +currentStaked.stakedAmount
        draft.stakePercent = stakedPercent * 100
        draft.edgeReward = 0
        draft.frozenStake = new BigNumber(stakedPercent).times(totalFrozen).toNumber()
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
    const interval = setInterval( hydrateData, 5000)
    return () => clearInterval( interval )
  },[hydrateData])


  return { 
    bankInfo,
    userInfo,
    hydrateData,
    addresses:{
      bank: bankContract.address,
      staking: stakingContract.address
    },
    bankMethods,
    stakingMethods,
    getApyData
  }
}

export default useBank

type BankInfo = {
  totalFrozen: number,
  totalBankroll: number,
  totalStaked: number,
  availableProfit: number,
  profitThreshold: number,
  profitTotal: { total: number, remaining: number } | null,
  profitDistribution: number,
  thresholdPercent: number,
  stakingDistruted: number,
  bankDistributed: number,
  pendingStaked: number,
  apyPercent: RoiProps['apyData'],
  poolStart: Date | null,
}
const initBank: BankInfo = {
  totalFrozen: 0,
  totalBankroll: 0,
  totalStaked: 0,
  availableProfit: 0,
  profitThreshold: 0,
  profitTotal: {
    total: 0,
    remaining: 0
  },
  pendingStaked: 0,
  stakingDistruted: 0,
  bankDistributed: 0,
  profitDistribution: 0.6,
  thresholdPercent: 0,
  apyPercent: undefined,
  poolStart: null,
}
type UserInfo = {
  staked: number,
  stakingReward: number,
  edgeReward: number,
  stakePercent: number,
  frozenStake: number,
}

const initUser: UserInfo ={
  staked: 0,
  stakingReward: 0,
  edgeReward: 0,
  stakePercent: 0,
  frozenStake: 0,
}