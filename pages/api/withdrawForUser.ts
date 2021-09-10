import { NextApiRequest, NextApiResponse } from "next"
import Web3 from 'web3'
// CONTRACT
import { getContracts } from 'data/contracts'

export default async function withdrawForUser( req: NextApiRequest, res: NextApiResponse){

  const bodyData: { amount?: number, account?: string, chain?: number } = JSON.parse(req.body || '{}')
  const { amount = 100, account = "0x7Ff20b4E1Ad27C5266a929FC87b00F5cCB456374", chain = 97 } = bodyData
  // if(!bodyData.amount || !bodyData.account || !bodyData.chain)
  //   return res.status(400).send({ message: 'Invalid Request'})

  // SETUP BLOCKCHAIN
  const provider = 'https://data-seed-prebsc-2-s2.binance.org:8545/'
  const web3 = new Web3( new Web3.providers.HttpProvider( provider ) )
  const setup = getContracts('liveWallet', 97 )
  const contract = await new web3.eth.Contract( setup.abi, setup.address )
  // START BALANCE
  const ogBalance = await contract.methods.betAmounts(account).call()
  // Authorize Owner
  // const ownerAccount = await web3.eth.accounts.privateKeyToAccount( process.env.OWNER_PKEY)
  // await contract.methods.withdrawBetForUser(amount, account).send({ from: ownerAccount.address })
  // NEW BALANCE
  // const newBalance = await contract.methods.balanceOf(account).call()
  res.send({ 
    // account: ownerAccount.address,
    methods: contract,
    initBalance: ogBalance,
    // updatedBalance: newBalance
  })
}