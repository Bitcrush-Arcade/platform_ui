// Import ABI's to use
import BitcrushFactory from 'abi/BitcrushFactory.json'
import BitcrushMigrator from 'abi/BitcrushMigrator.json'
import BitcrushRouter01 from 'abi/BitcrushRouter01.json'
import CrushToken from 'abi/CrushToken.json'
import MasterChef from 'abi/MasterChef.json'
import SyrupBar from 'abi/SyrupBar.json'
// 
import { AbiItem } from 'web3-utils'
/*
* TESTNET: 97
* MAINNET: 56
*/
export const contracts : { [key: string] : { 56: string, 97:string, abi: any }} = {
  factory: {
    56: '',
    97: '0x00032419a080D587eada138C6174255c4bAc726d',
    abi: BitcrushFactory.abi,
  },
  router: {
    56: '',
    97: '0xc05D2A4C227CD448235a1726C8CCe0175e6e603e',
    abi: BitcrushRouter01.abi,
  },
  crushToken:{
    56: '0x0ef0626736c2d484a792508e99949736d0af807e',
    97: '0xa3ca5df2938126bae7c0df74d3132b5f72bda0b6',
    abi: CrushToken.abi,
  },
  masterChef:{
    56: '',
    97: '0xA9171F6564F902C735e0275DeADCfCb049c6e213',
    abi: MasterChef.abi,
  },
  syrupBar:{
    56: '',
    97: '0x4237FD226fB1c3AAc63Cb3c18A0FbAEe16Ce5B07',
    abi: SyrupBar.abi,
  },
  migrator:{
    56: '',
    97: '0x5f8a6a61AED3503443f9d681A0eda25eE7e04968',
    abi: BitcrushMigrator.abi,
  },
}

export const getContracts = (contract: string, chainId: number ): { address: string, abi: AbiItem } => {
  const data = contracts[contract]
  return {
    address: [56,97].indexOf(chainId) > -1 && data[chainId] || '',
    abi: data.abi
  }
}