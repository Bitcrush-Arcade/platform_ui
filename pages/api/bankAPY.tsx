import { NextApiRequest, NextApiResponse } from 'next'
// Date-fns
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
// Web3
import Web3 from 'web3'
import { fromWei } from 'web3-utils'
import BigNumber from 'bignumber.js'
// Utils
import { currencyFormat } from 'utils/text/text'
// Data
import { getContracts } from 'data/contracts'

export default async function bankAPY(req : NextApiRequest, res: NextApiResponse){
  BigNumber.config({ DECIMAL_PLACES: 18 })
  // Check validity of request
  const body = JSON.parse(req.body || "{}" )

  const host = req.headers.host
  const isLocal = host.indexOf('localhost:') > -1
  if( !isLocal && ( req.method !== 'POST' || !body.chainId ) )
    return res.status(400).json({ error: "Request Invalid"})
  
    // Fetch current crushPrice
  const price = await fetch(`http${isLocal ? '' : 's'}://${host}/api/getPrice`).then( r => r.json() )

  const initStake = new BigNumber( 1000 ).div( price.crushUsdPrice ).times( new BigNumber(10).pow(18) ).toNumber()

  const usedChain = body.chainId ? parseInt( body.chainId ) : 97
  const provider = usedChain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-2-s2.binance.org:8545/'
  const web3 = new Web3( new Web3.providers.HttpProvider( provider ) )
  // Contract Setup
    // Bankroll Staking
  const contractSetup = getContracts( 'bankStaking', usedChain )
  const stakingContract = await new web3.eth.Contract( contractSetup.abi, contractSetup.address )
    // Bankroll Contract
  const bankSetup = getContracts('bankroll', usedChain)
  const bankContract = await new web3.eth.Contract( bankSetup.abi, bankSetup.address )
  // Staking 
  const stakingDivisor = 10000// new BigNumber( await stakingContract.methods.divisor().call() )
  const claimerFee = new BigNumber( await stakingContract.methods.performanceFeeCompounder().call() ).div( stakingDivisor )
  const burnFee = new BigNumber( await stakingContract.methods.performanceFeeBurn().call() ).div( stakingDivisor )
  const reserveFee = new BigNumber( await stakingContract.methods.performanceFeeReserve().call() ).div( stakingDivisor )
  const performanceFee = claimerFee.plus(burnFee).plus(reserveFee)
  const emission = new BigNumber( await stakingContract.methods.crushPerBlock().call() )
  const actualTotalStaked = new BigNumber( await stakingContract.methods.totalStaked().call() )
  const totalStaked = (actualTotalStaked.isEqualTo( 0 ) ? new BigNumber( 1000000 ).times( new BigNumber(10).pow(18) ) : actualTotalStaked).toNumber()
  const deployTime = new BigNumber( await stakingContract.methods.deploymentTimeStamp().call() )
  // Bankroll
  const totalProfit = new BigNumber( await bankContract.methods.totalProfit().call() )
  // TotalProfit / ( days Since ContractLaunch ) / 288 claims per day
  const profitEmission = totalProfit.isGreaterThan(0) ? totalProfit.div( differenceInCalendarDays( new Date(), new Date( deployTime.times(1000).toNumber() ) ) || 1 ).div( 288 ).toNumber() : 0
  const compoundRewards = {
    d1: {
      return: 0,
      percent: 0,
    },
    d7: {
      return: 0,
      percent: 0,
    },
    d30: {
      return: 0,
      percent: 0,
    },
    d365: {
      return: 0,
      percent: 0,
    },
    b1: {
      return: 0,
      percent: 0,
    },
    b7: {
      return: 0,
      percent: 0,
    },
    b30: {
      return: 0,
      percent: 0,
    },
    b365: {
      return: 0,
      percent: 0,
    },
  }

  let compoundedReward = 0
  let houseEdgeProfit = 0
  const d1Check =288
  const d7Check = 288 * 7
  const d30Check = 288 * 30
  const maxCompounds = new BigNumber( 288 ).times( 365 )

  const blocksPerCompound = 12 * 5 // BLOCKS PER MINUTE  * 5 MINUTE

  const stakingEmission = emission.times( new BigNumber(1).minus( performanceFee ) ).toNumber() // in wei
  for( 
    let compoundBlock = 1;
    maxCompounds.isGreaterThanOrEqualTo(compoundBlock);
    compoundBlock++
  ){

    const compoundedTotalStaked = (compoundBlock -1 ) * ((blocksPerCompound * stakingEmission) + profitEmission) + totalStaked
    const poolPercent = (initStake + compoundedReward + houseEdgeProfit )/compoundedTotalStaked 
    compoundedReward += ( stakingEmission * poolPercent * blocksPerCompound )
    houseEdgeProfit += ( profitEmission * poolPercent )
    if( compoundBlock == d1Check && !compoundRewards.d1.return ){
      compoundRewards.d1.return = new BigNumber(compoundedReward).div( new BigNumber(10).pow(18)).toNumber()
      compoundRewards.d1.percent = compoundedReward / initStake
      compoundRewards.b1.return = new BigNumber(houseEdgeProfit).div( new BigNumber(10).pow(18)).toNumber()
      compoundRewards.b1.percent = houseEdgeProfit / initStake
    }
    if( compoundBlock == d7Check && !compoundRewards.d7.return ){
      compoundRewards.d7.return = new BigNumber(compoundedReward).div( new BigNumber(10).pow(18)).toNumber()
      compoundRewards.d7.percent = compoundedReward / initStake
      compoundRewards.b7.return = new BigNumber(houseEdgeProfit).div( new BigNumber(10).pow(18)).toNumber()
      compoundRewards.b7.percent = houseEdgeProfit / initStake
    }
    if( compoundBlock == d30Check && !compoundRewards.d30.return ){
      compoundRewards.d30.return = new BigNumber(compoundedReward).div( new BigNumber(10).pow(18)).toNumber()
      compoundRewards.d30.percent = compoundedReward / initStake
      compoundRewards.b30.return = new BigNumber(houseEdgeProfit).div( new BigNumber(10).pow(18)).toNumber()
      compoundRewards.b30.percent = houseEdgeProfit / initStake
    }
  }
  compoundRewards.d365.return = new BigNumber(compoundedReward).div( new BigNumber(10).pow(18)).toNumber()
  compoundRewards.d365.percent = compoundedReward / initStake
  compoundRewards.b365.return = new BigNumber(houseEdgeProfit).div( new BigNumber(10).pow(18)).toNumber()
  compoundRewards.b365.percent = houseEdgeProfit / initStake

  res.status(200).json({
    compoundRewards,
    initStake,
    stakingEmission,
    profitEmission
  })
}