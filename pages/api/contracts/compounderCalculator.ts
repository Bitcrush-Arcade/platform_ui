import { NextApiRequest, NextApiResponse } from 'next'
// Web3
import Web3 from 'web3'
import BigNumber from 'bignumber.js'
// Data
import { getContracts } from 'data/contracts'

const compounderCalculator = async(req: NextApiRequest, res: NextApiResponse)=>{

  
  const { chain } = JSON.parse(req.body)
  if( req.method !== "POST" || !chain ){
    res.status(400).send({ error: "Invalid Request" })
    return
  }
  
  // GET CONTRACT DATA
  const usedChain = parseInt( chain )
  const provider = usedChain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-1-s1.binance.org:8545/'
  const web3 = new Web3( new Web3.providers.HttpProvider( provider ) )
  const { address, abi } = getContracts('bankStaking', usedChain)
  
  const { methods } = await new web3.eth.Contract( abi, address )
  // profit[0] => { total, remaining }
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
    return res.status( 200 ).json({ 
      compounderBounty: 0,
    })
  
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
  res.status( 200 ).json({ 
    compounderBounty: stakeReward.times(compounderFee).div( new BigNumber(10).pow(18) ).toNumber(),
  })


}

export default compounderCalculator