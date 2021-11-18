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
      address: '0x5326C45a31DEEBa15EDC68055bF69b2682c9B215',
      abi: BitcrushLiveWallet.abi,
    },
    97:{
      address: '0x974B38eAa7fc4FAE6A2802fC8C9984D86041A143',
      abi: BitcrushLiveWallet.abi,
    }
  },
  bankroll:{
    56:{
      address: '0xF43A7d04DcD76601dE0B0d03D761B09fBF095502',
      abi: BitcrushBankroll.abi,
    },
    97:{
      address: '0x3BEB4d5c5477bae4438945D0e0f43655E8aBE51a',
      abi: BitcrushBankroll.abi,
    }
  },
  bankStaking:{
    56:{
      address: '0x9D1Bc6843130fCAc8A609Bd9cb02Fb8A1E95630e',
      abi: BitcrushStaking.abi,
    },
    97:{
      address: '0x82dd2A379E26A6a7Fc3587C5022fdBFC67960c92',
      abi: BitcrushStaking.abi,
    }
  },
  prevLw:{
    56:{
      address: '0xCd8AFEfFfd6E5b8cFC6C0c3348d984751496be51',
      abi: BitcrushLiveWallet.abi,
    },
    97:{
      address: '0x42Da4A343C8C39586c51793bfE6eE65A010E4189',
      abi: BitcrushLiveWallet.abi,
    }
  },
  prevStaking2:{
    56:{
      address: '0x6c337602D418422D71bB64F348B4aEF1e77766e4',
      abi: BitcrushStaking.abi,
    },
    97:{
      address: '0x534828eDC1994d937d8d8113b3f0da751Cbc5e10',
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
