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
    fetch('/api/getAPY',{
      method: 'POST',
      body: JSON.stringify({
        chainId: chainId || 56,
        contract: 'bankStaking'
      })
    })
      .then( response => response.json() )
      .then( data => setBankInfo( draft => {
        draft.apyPercent = data
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
    setBankInfo( draft => {
      draft.totalBankroll = +totalBankroll
      draft.profitThreshold = +profitThreshold
      draft.availableProfit =  new BigNumber(availableProfit).times( sharePercent ).minus(negativeProfit).toNumber()
      draft.thresholdPercent = parseFloat( new BigNumber(availableProfit).times( sharePercent ).div( new BigNumber(profitThreshold) ).times(100).toFixed(2) )
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
      const poolStart = await stakingMethods.deploymentTimeStamp().call()

      let profits:{ total: number, remaining: number} = { total: 0, remaining: 0}
      await stakingMethods.profits(0).call({}, (err, result) => {
        if(err) return
        profits = result
      })
      .catch( e => console.log('error2', e))
      
      
      setBankInfo(draft => {
        draft.totalStaked = new BigNumber(totalStaked).minus( totalFrozen ).toNumber()
        draft.profitTotal = profits
        draft.stakingDistruted = new BigNumber( distributedProfit ).plus( totalClaimed ).toNumber()
        draft.poolStart = new Date( parseInt(poolStart) * 1000 )
      })
      
      if(!account) return
      const userRewards = await stakingMethods.pendingReward(account).call()
      const currentStaked = await stakingMethods.stakings(account).call()

      setUserInfo( draft => {
        draft.stakingReward = +userRewards
        draft.staked = +currentStaked.stakedAmount
        draft.stakePercent = (+currentStaked.stakedAmount)/(+totalStaked || 1) * 100
        draft.edgeReward = 0
        draft.frozenStake = new BigNumber(currentStaked.stakedAmount).div(+totalStaked || 1).times(totalFrozen).toNumber()
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
      staking: stakingContract.address
    },
    bankMethods,
    stakingMethods,
    getApyData
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
  stakingDistruted: number,
  bankDistributed: number,
  apyPercent: RoiProps['apyData'],
  poolStart: Date | null,
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