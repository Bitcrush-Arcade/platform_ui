import { useEffect } from 'react'
import { useImmer } from 'use-immer'

function useBank(){

  const [ bankInfo, setBankInfo ] = useImmer<BankInfo>({ stakingReward: 0, edgeReward: 0, bankRoll: 0, distributed: 0, houseProfit: 0 })
  const [ userInfo, setUserInfo ] = useImmer<UserInfo>({ staked: 0, stakingReward: 0, edgeReward: 0 })

  return { bankInfo, userInfo }
}

export default useBank

type BankInfo = {
  stakingReward: number,
  edgeReward: number,
  bankRoll: number,
  distributed: number,
  houseProfit: number,
}
type UserInfo = {
  staked: number,
  stakingReward: number,
  edgeReward: number,
}