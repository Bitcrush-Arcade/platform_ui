import { NextApiRequest, NextApiResponse } from 'next'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { getContracts } from 'data/contracts'
import BigNumber from 'bignumber.js'
import PancakeAbi from 'abi/PancakeAbi.json'

export default async function chefApy(req: NextApiRequest, res: NextApiResponse)
{
  if (req.method !== "POST")
    return res.status(400).json({ error: "Invalid Request" });

  // // GET SENT DATA (PID)
  const body = JSON.parse(req.body || "{}")

  const host = req.headers.host
  const isLocal = (host || '').indexOf('localhost:') > -1
  if (!isLocal && (req.method !== 'POST' || !body.chainId))
    return res.status(400).json({ error: "Request Invalid" })

  // Fetch current crushPrice
  const price = await fetch(`http${isLocal ? '' : 's'}://${host}/api/getPrice`).then(r => r.json())
  const { niceUsdPrice } = price

  if (!body.pid || !body.chainId)
    return res.status(400).json({ error: "Invalid Request" });
  const { pid } = body
  // CONNECT TO BLOCKCHAIN
  const usedChain = 56
  const provider = usedChain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-2-s2.binance.org:8545/'
  const web3 = new Web3(new Web3.providers.HttpProvider(provider))
  const contractSetup = getContracts('galacticChef', usedChain)
  if (!contractSetup.abi)
    return res.status(400).json({ message: 'No contract ABI' });
  const chefContract = await new web3.eth.Contract(contractSetup.abi, contractSetup.address)
  // TOKEN RECEIVED
  const poolInfo = await chefContract.methods.poolInfo(pid).call()
  const { token, mult, isLP } = poolInfo
  if (parseInt(mult) == 0)
    return res.status(200).json({ apy: 0, d1: 0, d7: 0, d30: 0, d365: 0 })
  const tokenSetup = getContracts('crushToken', 56)
  if (!tokenSetup.abi)
    return res.status(400).json({ message: 'No token contract ABI' });
  const tokenContract = await new web3.eth.Contract(tokenSetup.abi, token)
  let totalStaked = new BigNumber(await tokenContract.methods.balanceOf(contractSetup.address).call())
  // --------
  // TODO - get years since chef was deployed
  const allEmissions = await chefContract.methods.getAllEmissions(0).call()
  // --------
  const { _defi } = allEmissions
  const pidEmissions = new BigNumber(_defi).times(mult).div(1000000)
  let tokenPrice: number = 0;
  const bnbPrice = new BigNumber(await calcBNBPrice()).toNumber() // $/bnb
  if (isLP) {
    const tokenPair = await new web3.eth.Contract(pairAbi, token)
    // GET TOKEN0
    let token0Price;
    const token0 = await tokenPair.methods.token0().call()
    if (token0 == BNBTokenAddress) {
      token0Price = bnbPrice
    }
    else
      token0Price = (await calcSell(1, token0)).div(10 ** 18).toNumber()
    // GET TOKEN1
    let token1Price;
    const token1 = await tokenPair.methods.token1().call()
    if (token1 == BNBTokenAddress) {
      token1Price = bnbPrice
    }
    else
      token1Price = (await calcSell(1, token1)).div(10 ** 18).toNumber()

    // GET TOTAL RESERVES
    const reserves = await tokenPair.methods.getReserves().call()
    // GET TOTAL PRICE IN RESERVES
    const pairSupply = new BigNumber(await tokenPair.methods.totalSupply().call()).toNumber()
    tokenPrice = (token0Price * parseInt(reserves.reserve0) + parseInt(reserves.reserve1) * token1Price) / pairSupply
  }
  else {
    const maxOut = (await calcSell(1, token)).div(10 ** 18).toNumber() // BNB PER TOKEN 
    tokenPrice = maxOut * (bnbPrice) // USD PER TOKEN
  }
  let shares = new BigNumber(1).div(tokenPrice).times(1000).toNumber() // tokens per 1000USD
  if (totalStaked.isEqualTo(0))
    totalStaked = new BigNumber(1);


  // TOKEN PRICE * 1000 USD AS SHARE AMOUNT
  // NICE EMITTED
  const emissions = pidEmissions.times(3600).times(24).div(10 ** 18).toNumber()// PER day)

  const emissionPerDay = totalStaked.div(10 ** 18).isLessThan(shares) ? shares * emissions / totalStaked.div(10 ** 18).plus(shares).toNumber() : shares * emissions / totalStaked.div(10 ** 18).toNumber()
  let accumulated = 0;
  let totalShares = totalStaked.div(10 ** 18).toNumber()
  let day1 = 0;
  let day7 = 0;
  let day30 = 0;
  let day365 = 0;
  for (let i = 1; i <= 365; i++) {
    const current = shares * emissions / totalShares
    accumulated += current
    if (i == 1)
      day1 = accumulated
    if (i == 7)
      day7 = accumulated
    if (i == 30)
      day30 = accumulated
    if (i == 365)
      day365 = accumulated
    const sharesIfCompounded = accumulated * niceUsdPrice / tokenPrice
    totalShares += sharesIfCompounded
    shares += sharesIfCompounded
  }

  // NICE PRICE
  // EACH RETURN * NICE PRICE
  res.status(200).json({
    tokenPrice,
    emissionPerDay,
    apr: emissionPerDay * 365 * niceUsdPrice / 1000,
    d1: day1.toFixed(18),
    d7: day7.toFixed(18),
    d30: day30.toFixed(18),
    d365: day365.toFixed(18),
    d1Usd: day1 * niceUsdPrice / 1000,
    d7Usd: day7 * niceUsdPrice / 1000,
    d30Usd: day30 * niceUsdPrice / 1000,
    d365Usd: day365 * niceUsdPrice / 1000,
  })
}


async function calcBNBPrice()
{
  const web3 = new Web3("https://bsc-dataseed1.binance.org");
  const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" //BNB
  const USDTokenAddress = "0x55d398326f99059fF775485246999027B3197955" //USDT
  let bnbToSell = web3.utils.toWei("1", "ether");
  let amountOut;
  try {
    let router = await new web3.eth.Contract(PancakeAbi.abi as AbiItem[], pancakeSwapContract);
    amountOut = await router.methods.getAmountsOut(bnbToSell, [ BNBTokenAddress, USDTokenAddress ]).call();
    amountOut = web3.utils.fromWei(amountOut[ 1 ]);
  } catch (error) { }
  if (!amountOut) return 0;
  return amountOut;
}
// Returns the amount of BNB after a sell
async function calcSell(tokensToSell: number, tokenAddres: string)
{
  const web3 = new Web3("https://bsc-dataseed1.binance.org");
  const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" //BNB

  let tokenRouter = await new web3.eth.Contract(tokenAbi, tokenAddres);
  let tokenDecimals = await tokenRouter.methods.decimals().call();

  const sellTokens = new BigNumber(tokensToSell).times(new BigNumber(10).pow(tokenDecimals));
  let amountOut;
  const routerContract = [ pancakeSwapContract, apeswapContract, knightswapContract ]
  const outPrices = []
  for (let i = 0; i < routerContract.length; i++) {
    try {
      let router = await new web3.eth.Contract(PancakeAbi.abi as AbiItem[], routerContract[ i ]);
      amountOut = await router.methods.getAmountsOut(sellTokens.toString(), [ tokenAddres, BNBTokenAddress ]).call();
      amountOut = outPrices.push(new BigNumber(amountOut[ 1 ]));
    } catch (error) { }
  }
  if (!outPrices.length) return new BigNumber(0);
  amountOut = outPrices.reduce((pv, val) =>
  {
    if (pv.isGreaterThan(val))
      return pv
    else
      return val
  }, new BigNumber(0))
  return amountOut;
}
const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" //BNB
const pancakeSwapContract = "0x10ED43C718714eb63d5aA57B78B54704E256024E".toLowerCase();
const apeswapContract = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7".toLowerCase()
const knightswapContract = "0x05E61E0cDcD2170a76F9568a110CEe3AFdD6c46f".toLowerCase();
const tokenAbi: AbiItem[] = [ { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }, { "internalType": "uint256", "name": "_decimals", "type": "uint256" }, { "internalType": "uint256", "name": "_supply", "type": "uint256" }, { "internalType": "uint256", "name": "_txFee", "type": "uint256" }, { "internalType": "uint256", "name": "_burnFee", "type": "uint256" }, { "internalType": "uint256", "name": "_charityFee", "type": "uint256" }, { "internalType": "address", "name": "_FeeAddress", "type": "address" }, { "internalType": "address", "name": "tokenOwner", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "FeeAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_BURN_FEE", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_CHARITY_FEE", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_TAX_FEE", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_value", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" } ], "name": "decreaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tAmount", "type": "uint256" } ], "name": "deliver", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "excludeAccount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "includeAccount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" } ], "name": "increaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "isCharity", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "isExcluded", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tAmount", "type": "uint256" }, { "internalType": "bool", "name": "deductTransferFee", "type": "bool" } ], "name": "reflectionFromToken", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "setAsCharityAccount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "rAmount", "type": "uint256" } ], "name": "tokenFromReflection", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalBurn", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalCharity", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalFees", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_txFee", "type": "uint256" }, { "internalType": "uint256", "name": "_burnFee", "type": "uint256" }, { "internalType": "uint256", "name": "_charityFee", "type": "uint256" } ], "name": "updateFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];
const pairAbi: AbiItem[] = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "Burn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "name": "Mint",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount0In",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount1In",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount0Out",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount1Out",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "Swap",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint112",
        "name": "reserve0",
        "type": "uint112"
      },
      {
        "indexed": false,
        "internalType": "uint112",
        "name": "reserve1",
        "type": "uint112"
      }
    ],
    "name": "Sync",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINIMUM_LIQUIDITY",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PERMIT_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "burn",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factory",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      {
        "internalType": "uint112",
        "name": "reserve0",
        "type": "uint112"
      },
      {
        "internalType": "uint112",
        "name": "reserve1",
        "type": "uint112"
      },
      {
        "internalType": "uint32",
        "name": "blockTimestampLast",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "kLast",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "liquidity",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "price0CumulativeLast",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "price1CumulativeLast",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "skim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount0Out",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount1Out",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "swap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sync",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token0",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token1",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
