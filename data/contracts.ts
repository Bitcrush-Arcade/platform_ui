// Import ABI's to use
import CrushToken from 'abi/CrushToken.json'
import BitcrushStaking_main from 'abi/BitcrushStaking_main.json'
import BitcrushLiveWallet from 'abi/BitcrushLiveWallet.json'
import BitcrushStaking from 'abi/BitcrushStakingv2.json'
import BitcrushBankroll from 'abi/BitcrushBankroll.json'
import BitcrushLottery from 'abi/BitcrushLottery.json'
import FeeDistributor from 'abi/FeeDistributor.json'
import GalacticChef from 'abi/GalacticChef.json'
import InvaderPool from 'abi/InvaderPool.json'
import NiceStaking from 'abi/BitcrushNiceStaking.json'
import NICEToken from 'abi/NICEToken.json'
import Presale from 'abi/Presale.json'
import PresaleV2 from 'abi/Presalev2.json'
import TokenLock from 'abi/TokenLock.json'
// 
import { AbiItem } from 'web3-utils'
/*
* TESTNET: 97
* MAINNET: 56
*/
export const contracts: { [ key: string ]: ContractSelect } = {
  crushToken: {
    56: {
      address: '0x0ef0626736c2d484a792508e99949736d0af807e',
      abi: CrushToken.abi
    },
    97: {
      address: '0xa3ca5df2938126bae7c0df74d3132b5f72bda0b6',
      abi: CrushToken.abi
    },
  },
  liveWallet: {
    56: {
      address: '0x5326C45a31DEEBa15EDC68055bF69b2682c9B215',
      abi: BitcrushLiveWallet.abi,
    },
    97: {
      address: '0x581DfD0B05AA9196FcD7553cAcb238161930d954',
      abi: BitcrushLiveWallet.abi,
    }
  },
  bankroll: {
    56: {
      address: '0xF43A7d04DcD76601dE0B0d03D761B09fBF095502',
      abi: BitcrushBankroll.abi,
    },
    97: {
      address: '0xb40287dA5A314F6AB864498355b1FCDe6703956D',
      abi: BitcrushBankroll.abi,
    }
  },
  bankStaking: {
    56: {
      address: '0x9D1Bc6843130fCAc8A609Bd9cb02Fb8A1E95630e',
      abi: BitcrushStaking.abi,
    },
    97: {
      address: '0x8139cA222D38296daB88d65960Ca400dcd95b246',
      abi: BitcrushStaking.abi,
    }
  },
  lottery: {
    56: {
      address: '0x9B55987e92958d3d6Af48Dd2DB1C577593401f78',
      abi: BitcrushLottery.abi,
    },
    97: {
      address: '0x5979522D00Bd8D9921FcbDA10F1bfD5abD09417f',
      abi: BitcrushLottery.abi,
    }
  },
  presale: {
    56: {

      address: "0x87F8e8f9616689808176d3a97a506c8cEeD32674",
      // address: "0x8b0E34aa5442B770aFd404f596d12833B9D73cA3",
      abi: PresaleV2.abi,
    },
    97: {
      address: "0x6D7210Dcf8c5BA3f045BdDe0d09c3c63382e3B4b",
      // address: "0xFa567aC8Ff6C3fFd18B1F7fB711A741164EBd95D",
      abi: PresaleV2.abi,
      // abi: Presale.abi,
    },
  },
  galacticChef: {
    56: {
      address: '0x510C617f990143eC9165C1978D70c0b4c7E369f1',
      abi: GalacticChef.abi
    },
    97: {
      address: '0x1ccbfe1E7046d6aaaC68f6C17BD01628fd5F638e',
      abi: GalacticChef.abi
    },
  },
  feeDistributor: {
    56: {
      address: '0x45f194a1F2269904a181d6d29727aee4882B7995',
      abi: FeeDistributor.abi
    },
    97: {
      address: '0x82306aB3edB8A4BD7725a0b40B85f8975A2C6849',
      abi: FeeDistributor.abi
    },
  },
  tokenLocker: {
    56: {
      address: "0xaeF0c6Db4C7B3EAF27C63B32Ea7397f296ed4247",
      abi: TokenLock.abi,
    },
    97: {
      address: "",
      abi: TokenLock.abi,
    },
  },
  niceCompounder: {
    56: {
      address: '',
      abi: NiceStaking.abi
    },
    97: {
      address: '0xb8522747Ac79Dc8cE089CfD745fE7eE9CA01D157',
      abi: NiceStaking.abi
    }
  },
  niceToken: {
    56: {
      address: '',
      abi: NICEToken.abi
    },
    97: {
      address: '0xAD026d8ae28bafa81030a76548efdE1EA796CB2C',
      abi: NICEToken.abi
    },
  },
  invaderPool: {
    56: {
      address: '',
      abi: InvaderPool.abi
    },
    97: {
      address: '',
      abi: InvaderPool.abi
    },
  },
  // -------------------------------------------------------------
  // Discontinued
  // -------------------------------------------------------------
  singleAsset: {
    56: {
      address: '0x4Bc5dCbbF7bd30C301544279545D426886c89b4d',
      abi: BitcrushStaking_main.abi
    },
    97: {
      address: '0x127dfc82C778aa125564d5B4aD6Fb508c6737341',
      abi: BitcrushStaking_main.abi
    },
  },
  // -------------------------------------------------------------
  // FUCKED UP CONTRACTS
  // -------------------------------------------------------------
  prevLw: {
    56: {
      address: '0xCd8AFEfFfd6E5b8cFC6C0c3348d984751496be51',
      abi: BitcrushLiveWallet.abi,
    },
    97: {
      address: '0x42Da4A343C8C39586c51793bfE6eE65A010E4189',
      abi: BitcrushLiveWallet.abi,
    }
  },
  prevStaking2: {
    56: {
      address: '0x6c337602D418422D71bB64F348B4aEF1e77766e4',
      abi: BitcrushStaking.abi,
    },
    97: {
      address: '0x534828eDC1994d937d8d8113b3f0da751Cbc5e10',
      abi: BitcrushStaking.abi,
    }
  }

}

export const getContracts = (contract: string, chainId?: number): { address: string, abi: AbiItem | null } =>
{
  if (!chainId)
    return { address: '', abi: null }
  const data = contracts[ contract ][ chainId ]
  return {
    address: data?.address || '',
    abi: data?.abi || ''
  }
}
type ContractSelect = {
  [ key: number ]: {
    address: string,
    abi: any
  }
}