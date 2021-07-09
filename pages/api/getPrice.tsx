import { NextApiRequest, NextApiResponse } from 'next'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'



export default async function getPrice(req : NextApiRequest, res: NextApiResponse){

  const web3 = new Web3( new Web3.providers.HttpProvider('https://bsc-dataseed1.defibit.io/') )

  // POOL ADDRESS
  const contract = await new web3.eth.Contract(APE_ABI as AbiItem[], '0x8A10489f1255fb63217Be4cc96B8F4CD4D42a469')

  const totalCrush = await contract.methods.getReserves().call()

  const res0 = new BigNumber( totalCrush._reserve0 ).div( new BigNumber(10).pow(18) ) //CRUSH RESERVE AMOUNT
  const res1 = new BigNumber( totalCrush._reserve1 ).div( new BigNumber(10).pow(18) ) //WBNB RESERVE AMOUNT

  // GET BNB USD price
  const bnbExchange = await fetch('https://api-bsc.idex.io/v1/exchange',{
    headers:{
      method: 'GET'
    }
  })
  .then( resp => resp.json() )
  .catch( err => {
    console.log('exchange Error')
    return { bnbUsdPrice: -1, error: err }
  })

  if(bnbExchange.bnbUsdPrice < 0)
    return res.status(500).json({ error: "Error fetching bnb/Usd Price", errorResponse: bnbExchange.error })

  const crushUsdPrice = new BigNumber( bnbExchange.bnbUsdPrice ).times( res1.div( res0 ) )

  return res.status(200).json({ message: 'Success Fetching CrushPrice', crushUsdPrice })
}

const APE_ABI = [
  {
    "constant":true,
    "inputs":[],
    "name":"getReserves",
    "outputs":[
      {
        "internalType":"uint112",
        "name":"_reserve0",
        "type":"uint112"
      },{
        "internalType":"uint112",
        "name":"_reserve1",
        "type":"uint112"
      },{
        "internalType":"uint32",
        "name":"_blockTimestampLast",
        "type":"uint32"
    }],
    "payable":false,"stateMutability":"view","type":"function"}
]