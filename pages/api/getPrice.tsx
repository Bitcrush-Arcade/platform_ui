import { NextApiRequest, NextApiResponse } from 'next'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'



export default async function getPrice(req : NextApiRequest, res: NextApiResponse){

  const web3 = new Web3( new Web3.providers.HttpProvider('https://bsc-dataseed1.defibit.io/') )

  // POOL ADDRESS
  const crushBnb = await new web3.eth.Contract(APE_ABI as AbiItem[], '0x8A10489f1255fb63217Be4cc96B8F4CD4D42a469')
  const bnbBusd = await new web3.eth.Contract(APE_ABI as AbiItem[], '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16')

  const totalCrush = await crushBnb.methods.getReserves().call()
  const totalBusd = await bnbBusd.methods.getReserves().call()
  
  const crush1 = new BigNumber( totalCrush._reserve0 ).div( new BigNumber(10).pow(18) ) //CRUSH RESERVE AMOUNT
  const bnb1 = new BigNumber( totalCrush._reserve1 ).div( new BigNumber(10).pow(18) ) //WBNB RESERVE AMOUNT
  const bnb2 = new BigNumber( totalBusd._reserve0 ).div( new BigNumber(10).pow(18) ) //WBNB RESERVE AMOUNT
  const busd2 = new BigNumber( totalBusd._reserve1 ).div( new BigNumber(10).pow(18) ) //BUSD RESERVE AMOUNT

  // GET BNB USD price
  const crushUsdPrice = bnb1.times(busd2).div( bnb2.times(crush1) )

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