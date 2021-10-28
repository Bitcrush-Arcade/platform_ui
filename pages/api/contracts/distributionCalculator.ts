import { NextApiRequest, NextApiResponse } from 'next'
// Web3
import Web3 from 'web3'
import BigNumber from 'bignumber.js'
// Data
import { getContracts } from 'data/contracts'

const calculateDistribution = async(req: NextApiRequest, res: NextApiResponse)=>{

  const { chain, account } = JSON.parse(req.body)
  if( req.method !== "POST" || !chain || !account){
    res.status(400).send({ error: "Invalid Request" })
    return
  }
  
  // GET CONTRACT DATA
  const usedChain = parseInt( chain )
  const provider = usedChain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-1-s1.binance.org:8545/'
  const web3 = new Web3( new Web3.providers.HttpProvider( provider ) )
  const { address, abi } = getContracts('bankStaking', usedChain)
  
  const { methods } = await new web3.eth.Contract( abi, address )
  // GET INIT VARIABLES
  let profit
  try {
    profit = await methods.profits(0).call()
  }
  catch{
    profit = { total: 0, remaining: 0}
  }
  // profit[0] => { total, remaining }

  const userStakings = await methods.stakings(account).call()
  const { index: userIndex } = userStakings || {}
  const startIndex = parseInt( await methods.batchStartingIndex().call() )
  const totalStaked = parseInt( await methods.totalStaked().call() )
  let addressesLength 
  try {
    addressesLength = parseInt( await methods.indexesLength().call() )
  }
  catch{
    addressesLength = 0
  }
  
  // CALCULATE REWARDS
  let userProfit = new BigNumber(0)
  let remainingProfit = new BigNumber(profit.remaining)
  for( let i = startIndex; i < (addressesLength + startIndex); i++){
    const reviewedIndex = i >= addressesLength ? addressesLength - i : i
    const indexedAddress = await methods.addressIndexes( reviewedIndex ).call()
    const stakings = await methods.stakings( indexedAddress ).call()

    const calcShare = new BigNumber(profit.total).times(stakings.stakedAmount).div( totalStaked )
    const profitToAdd = calcShare.isGreaterThan( remainingProfit )
      ? remainingProfit
      : calcShare
    remainingProfit = remainingProfit.minus(profitToAdd)
    if( reviewedIndex == parseInt(userIndex) ){
      userProfit = profitToAdd
      break
    }
    if(remainingProfit.isLessThanOrEqualTo(0)){
      break
    }

  }
  res.status( 200 ).json({ 
    userProfit: userProfit.toNumber()
  })



}

export default calculateDistribution