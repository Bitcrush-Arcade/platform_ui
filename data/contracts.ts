// Import ABI's to use
import CrushToken from 'abi/CrushToken.json'
import BitcrushStaking_main from 'abi/BitcrushStaking_main.json'
import BitcrushLiveWallet from 'abi/BitcrushLiveWallet.json'
import BitcrushStaking from 'abi/BitcrushStakingv2.json'
import BitcrushBankroll from 'abi/BitcrushBankroll.json'
// 
import { AbiItem } from 'web3-utils'
/*
* TESTNET: 97
* MAINNET: 56
*/
export const contracts : { [key: string] : ContractSelect} = {
  crushToken:{
    56: {
      address: '0x0ef0626736c2d484a792508e99949736d0af807e',
      abi: CrushToken.abi
    },
    97: {
      address: '0xa3ca5df2938126bae7c0df74d3132b5f72bda0b6',
      abi: CrushToken.abi
    },
  },
  singleAsset:{
    56: {
      address: '0x4Bc5dCbbF7bd30C301544279545D426886c89b4d',
      abi: BitcrushStaking_main.abi
    },
    97: {
      address: '0x127dfc82C778aa125564d5B4aD6Fb508c6737341',
      abi: BitcrushStaking_main.abi
    },
  },
  liveWallet:{
    56:{
      address: '',
      abi: BitcrushLiveWallet.abi,
    },
    97:{
      address: '0x72C4147ED9c65F5046a3dbe2C9513C0f71eC1f77',
      abi: BitcrushLiveWallet.abi,
    }
  },
  bankroll:{
    56:{
      address: '',
      abi: BitcrushBankroll.abi,
    },
    97:{
      address: '0x44a34c0e4Bc13BB4c17696a1282fC549c77E1cce',
      abi: BitcrushBankroll.abi,
    }
  },
  bankStaking:{
    56:{
      address: '',
      abi: BitcrushStaking.abi,
    },
    97:{
      address: '0x5199E75f4ecDF7AEC030842B418513ea3121F792',
      abi: BitcrushStaking.abi,
    }
  }

}

export const getContracts = (contract: string, chainId: number ): { address: string, abi: AbiItem } => {
  const data = contracts[contract][chainId]
  return {
    address: data?.address || '',
    abi: data?.abi || ''
  }
}
type ContractSelect = { 
  [key: number]:{
    address: string,
    abi: any
  }
}
