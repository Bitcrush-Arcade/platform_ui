import { NextApiRequest, NextApiResponse } from 'next'
import Web3 from 'web3'
import { fromWei } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { currencyFormat } from 'utils/text/text'
import { getContracts } from 'data/contracts'
import minuteDifference from 'date-fns/differenceInMinutes'

let calculatedLast = new Date()
let previousCalc = undefined

export default async function getApy(req : NextApiRequest, res: NextApiResponse){
  // Check validity of request
  const body = JSON.parse(req.body || "{}" )
  const host = req.headers.host
  const isLocal = host.indexOf('localhost:') > -1
  if( !isLocal && ( req.method !== 'POST' || !body.chainId ) )
    return res.status(400).json({ error: "Request Invalid"})
  // if( previousCalc && minuteDifference( new Date(), calculatedLast ) < 30 )
  //   return res.status(304).json(previousCalc)
  // Fetch current crushPrice
  const price = await fetch(`http${isLocal ? '' : 's'}://${host}/api/getPrice`).then( r => r.json() )

  const initialStake = 1000 / price.crushUsdPrice 
  // Get info from contract
  const usedChain = body?.chainId ? parseInt(body.chainId) : 97
  const provider = usedChain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-2-s2.binance.org:8545/'
  const web3 = new Web3( new Web3.providers.HttpProvider( provider ) )
  const contractSetup = getContracts('singleAsset', usedChain )
  const contract = await new web3.eth.Contract( contractSetup.abi, contractSetup.address )

  const emission = await contract.methods.crushPerBlock().call()
  const totalStaked = fromWei( await contract.methods.totalStaked().call() )
  // const compounder =  await contract.methods.performanceFeeCompounder().call()
  // const reserve = await contract.methods.performanceFeeReserve().call()
  // const burn = await contract.methods.performanceFeeBurn().call()
  // const divisor = "10000"

  const performanceFee = 0.03
  const compoundEmitted = new BigNumber(emission).times(1 - performanceFee).times(100).toNumber()
  const totalPool = new BigNumber(totalStaked).toNumber() || new BigNumber( 1000000 ).times( new BigNumber(10).pow(18) ).toNumber()
  let d1 = 0
  let d7 = 0
  let d30 = 0
  const max = new BigNumber(288).times(365) // 288 compounds per day for 365 days
  const maxNumber = max.toNumber()
  let previousReward = 0
  for(let j= 1; j <= maxNumber; j ++ ){
    const EmitBlockTotal = compoundEmitted / ( totalPool + (compoundEmitted * ( j - 1 )))
    const reward = (initialStake + previousReward) * EmitBlockTotal
    previousReward += reward
    if( j == (1 * 288) && !d1 )
      d1 = previousReward
    if( j == (8 * 288) && !d7 )
      d7 = previousReward
    if( j == (30 * 288) && !d30 )
      d30 = previousReward
  }
  const readableD1 = new BigNumber(d1).toNumber()
  const readableD7 = new BigNumber(d7).toNumber()
  const readableD30 = new BigNumber(d30).toNumber()
  const readableD365 = new BigNumber(previousReward).toNumber()
  previousCalc = {
    constants:{
      initialStake,
      initialPool: totalPool,
      price: price.crushUsdPrice,
      crushPerBlock: new BigNumber(emission).div( new BigNumber(10).pow(18) ).toFixed(),
      fees: performanceFee
    },
    d1: {
      return: readableD1,
      percent: currencyFormat(readableD1 / initialStake * 100, { decimalsToShow: 2}) + '%',
    },
    d7: {
      return: readableD7,
      percent: currencyFormat(readableD7 / initialStake * 100, { decimalsToShow: 2}) + '%',
    },
    d30: {
      return: readableD30,
      percent: currencyFormat(readableD30 / initialStake * 100, { decimalsToShow: 2}) + '%',
    },
    d365: {
      return: readableD365,
      percent: currencyFormat(readableD365 / initialStake * 100, { decimalsToShow: 2}) + '%',
    },
  }
  calculatedLast = new Date()
  return res.status(200).json(previousCalc)
}