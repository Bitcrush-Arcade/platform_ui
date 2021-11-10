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


let calculatedLast = new Date()
let previousCalc = undefined

export default async function getApy(req : NextApiRequest, res: NextApiResponse){
  // Check validity of request
  const body = JSON.parse(req.body || "{}" )

  const host = req.headers.host
  const isLocal = host.indexOf('localhost:') > -1
  if( !isLocal && ( req.method !== 'POST' || !body.chainId ) )
    return res.status(400).json({ error: "Request Invalid"})
  
    // Fetch current crushPrice
  const price = await fetch(`http${isLocal ? '' : 's'}://${host}/api/getPrice`).then( r => r.json() )
  
  const usedContract = body.contract || 'singleAsset'
  const initialStake = new BigNumber(1000).div( price.crushUsdPrice ).times( new BigNumber(10).pow(18)).toNumber()
  // Get info from contract
  const usedChain = body?.chainId ? parseInt(body.chainId) : 97
  const provider = usedChain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-2-s2.binance.org:8545/'
  const web3 = new Web3( new Web3.providers.HttpProvider( provider ) )
  const contractSetup = getContracts( usedContract, usedChain )
  const contract = await new web3.eth.Contract( contractSetup.abi, contractSetup.address )

  const emission = await contract.methods.crushPerBlock().call()
  const totalStaked = await contract.methods.totalStaked().call()

  const performanceFee = 0.03
  const compoundEmitted = new BigNumber(emission).times(1 - performanceFee).toNumber()
  const totalPool = new BigNumber(totalStaked).toNumber() || new BigNumber( 1000000 ).times( new BigNumber(10).pow(18) ).toNumber()
  let d1 = 0
  let d7 = 0
  let d30 = 0
  const max = new BigNumber(288).times(365) // 288 compounds per day for 365 days
  const maxNumber = max.toNumber()
  let previousReward = 0
  for(let j= 1; j <= maxNumber; j ++ ){
    const EmitBlockTotal = compoundEmitted / ( totalPool + (compoundEmitted * ( j - 1 )*60))
    const reward = (initialStake + previousReward) * EmitBlockTotal*60
    previousReward += reward
    if( j == (1 * 288) && !d1 )
      d1 = previousReward
    if( j == (8 * 288) && !d7 )
      d7 = previousReward
    if( j == (30 * 288) && !d30 )
      d30 = previousReward
  }
  const readableD1 = new BigNumber(d1).div( new BigNumber(10).pow(18) ).toNumber()
  const readableD7 = new BigNumber(d7).div( new BigNumber(10).pow(18) ).toNumber()
  const readableD30 = new BigNumber(d30).div( new BigNumber(10).pow(18) ).toNumber()
  const readableD365 = new BigNumber(previousReward).div( new BigNumber(10).pow(18) ).toNumber()
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
      percent: d1 / initialStake,
    },
    d7: {
      return: readableD7,
      percent: d7 / initialStake,
    },
    d30: {
      return: readableD30,
      percent: d30 / initialStake,
    },
    d365: {
      return: readableD365,
      percent: previousReward / initialStake,
    },
  }
  calculatedLast = new Date()
  return res.status(200).json(previousCalc)
}