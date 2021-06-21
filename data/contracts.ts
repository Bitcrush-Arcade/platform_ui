// Import ABI's to use
import CrushToken from 'abi/CrushToken.json'
import BitcrushStaking from 'abi/BitcrushStaking.json'
// 
import { AbiItem } from 'web3-utils'
/*
* TESTNET: 97
* MAINNET: 56
*/
export const contracts : { [key: string] : { 56: string, 97:string, abi: any }} = {
  crushToken:{
    56: '0x0ef0626736c2d484a792508e99949736d0af807e',
    97: '0xa3ca5df2938126bae7c0df74d3132b5f72bda0b6',
    abi: CrushToken.abi,
  },
  singleAsset:{
    56:'',
    97: '0x2aAb243358df31b36D577198DE8C5c77ae456dC8',
    abi: BitcrushStaking.abi
  }
}

export const getContracts = (contract: string, chainId: number ): { address: string, abi: AbiItem } => {
  const data = contracts[contract]
  return {
    address: [56,97].indexOf(chainId) > -1 && data[chainId] || '',
    abi: data.abi
  }
}