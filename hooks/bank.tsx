import { useCallback, useEffect } from 'react'
// ThirdParty
import { useWeb3React } from '@web3-react/core'
import { useImmer } from 'use-immer'
// HOOKS
import { useContract } from 'hooks/web3Hooks'
import { getContracts } from 'data/contracts'
import BigNumber from 'bignumber.js'
import { toWei } from 'web3-utils'
// Types
import { RoiProps } from 'components/pools/RoiModal'

function useBank()
{
  // Get connection
  const { chainId, account } = useWeb3React()
  const [ bankContract, stakingContract, niceContract ] = [ getContracts('bankroll', chainId), getContracts('bankStaking', chainId), getContracts('niceCompounder', chainId) ]
  const { methods: bankMethods, web3 } = useContract(bankContract.abi, bankContract.address)
  const { methods: stakingMethods } = useContract(stakingContract.abi, stakingContract.address)
  const { methods: niceCompounderMethods } = useContract(niceContract.abi, niceContract.address)

  const [ bankInfo, setBankInfo ] = useImmer<BankInfo>(initBank)
  const [ userInfo, setUserInfo ] = useImmer<UserInfo>(initUser)

  const getApyData = () =>
  {
    if (!chainId) return
    fetch('/api/bankAPY', {
      method: 'POST',
      body: JSON.stringify({
        chainId: chainId || 56,
      })
    })
      .then(response => response.json())
      .then(data => setBankInfo(draft =>
      {
        draft.apyPercent = data.compoundRewards
      }))
  }

  useEffect(() => { getApyData() }, [ chainId ])



  // GET BANK DATA
  const getBankData = useCallback(async () =>
  {
    if (!bankMethods) return
    const totalBankroll = await bankMethods.totalBankroll().call()
    const availableProfit = await bankMethods.brSinceCompound().call()
    const negativeProfit = await bankMethods.negativeBrSinceCompound().call()
    const profitThreshold = await bankMethods.profitThreshold().call()
    const totalProfit = await bankMethods.totalProfit().call()
    const profitShare = await bankMethods.profitShare().call()
    const divisor = await bankMethods.DIVISOR().call()
    const sharePercent = new BigNumber(profitShare).div(divisor)
    const calculatedProfit = new BigNumber(availableProfit).times(sharePercent).minus(negativeProfit).toNumber()
    setBankInfo(draft =>
    {
      draft.totalBankroll = +totalBankroll
      draft.profitThreshold = +profitThreshold
      draft.availableProfit = calculatedProfit
      draft.thresholdPercent = calculatedProfit >= 0 ? new BigNumber(calculatedProfit).times(100).div(sharePercent.times(profitThreshold)).toNumber() : 0
      draft.bankDistributed = +totalProfit
    })
  }, [ bankMethods, setBankInfo ])

  useEffect(() =>
  {
    if (!bankMethods) return
    getBankData()
  }, [ getBankData, bankMethods ])

  // GET STAKING DATA

  const getStakingData = useCallback(async () =>
  {
    if (!stakingMethods) return
    const totalStaked = await stakingMethods.totalStaked().call()
    const totalFrozen = await stakingMethods.totalFrozen().call()
    const profitsClaimed = await stakingMethods.totalProfitsClaimed().call()
    const distributedProfit = await stakingMethods.totalProfitDistributed().call()
    const totalClaimed = await stakingMethods.totalClaimed().call()
    let poolStart: number
    try {
      poolStart = parseInt(await stakingMethods.deploymentTimeStamp().call())
    }
    catch {
      poolStart = new Date().getTime() / 1000 - (20 * 24 * 3600)
    }

    setBankInfo(draft =>
    {
      draft.profitsPending = new BigNumber(distributedProfit).minus(profitsClaimed).isGreaterThan(toWei('0.5'))
      draft.totalFrozen = new BigNumber(totalFrozen).toNumber()
      draft.totalStaked = new BigNumber(totalStaked).minus(totalFrozen).toNumber()
      draft.stakingDistributed = new BigNumber(distributedProfit).plus(totalClaimed).toNumber()
      draft.poolStart = new Date(poolStart * 1000)
    })

    if (!account) return
    let addressesLength = 0
    try {
      addressesLength = parseInt(await stakingMethods.indexesLength().call())
    }
    catch {
      addressesLength = 0
    }
    const currentStaked = addressesLength ? await stakingMethods.stakings(account).call() : { index: 0, stakedAmount: 0, claimedAmount: 0, lastBlockCompounded: 0 }
    const stakedPercent = (+currentStaked?.stakedAmount || 0) / (+totalStaked || 1)
    const userStakingReward = +(await stakingMethods.pendingReward(account).call())
    const profitReward = +(await stakingMethods.pendingProfits(account).call())
    const blockTimestamp = +(await web3.eth.getBlock(currentStaked.lastBlockCompounded)).timestamp

    const niceEarned = niceCompounderMethods ? new BigNumber(await niceCompounderMethods.niceRewards(account).call()).div(10 ** 18).toNumber() : 0

    setUserInfo(draft =>
    {
      draft.stakingReward = userStakingReward
      draft.edgeReward = profitReward
      draft.staked = +currentStaked.stakedAmount
      draft.stakePercent = stakedPercent * 100
      draft.frozenStake = new BigNumber(stakedPercent).times(totalFrozen).toNumber()
      draft.claimed = new BigNumber(currentStaked.claimedAmount).div(10 ** 18).toNumber()
      draft.lastAction = (blockTimestamp) * 1000 // converts timestamp to millisecond precision
      draft.niceEarned = niceEarned
    })

  }, [ stakingMethods, setUserInfo, setBankInfo, account, web3.eth, niceCompounderMethods ],
  )

  useEffect(() =>
  {
    if (!stakingMethods) return
    getStakingData()
  }, [ getStakingData, stakingMethods ])

  // REFETCH DATA EVERY 12 SECONDS
  const hydrateData = useCallback(() =>
  {
    getBankData()
    getStakingData()
  }, [ getBankData, getStakingData ])

  useEffect(() =>
  {
    const interval = setInterval(hydrateData, 5000)
    return () => clearInterval(interval)
  }, [ hydrateData ])


  return {
    bankInfo,
    userInfo,
    hydrateData,
    addresses: {
      bank: bankContract.address,
      staking: stakingContract.address
    },
    bankMethods,
    stakingMethods,
    getApyData,
    niceCompounderMethods,
  }
}

export default useBank

type BankInfo = {
  totalFrozen: number,
  totalBankroll: number,
  totalStaked: number,
  availableProfit: number,
  profitThreshold: number,
  profitsPending: boolean,
  profitDistribution: number,
  thresholdPercent: number,
  stakingDistributed: number,
  bankDistributed: number,
  apyPercent: RoiProps[ 'apyData' ],
  poolStart: Date | null,
}
const initBank: BankInfo = {
  totalFrozen: 0,
  totalBankroll: 0,
  totalStaked: 0,
  availableProfit: 0,
  profitThreshold: 0,
  stakingDistributed: 0,
  bankDistributed: 0,
  profitsPending: false,
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
  claimed: number,
  lastAction: number,
  niceEarned: number,
}

const initUser: UserInfo = {
  staked: 0,
  stakingReward: 0,
  edgeReward: 0,
  stakePercent: 0,
  frozenStake: 0,
  claimed: 0,
  lastAction: 0,
  niceEarned: 0
}