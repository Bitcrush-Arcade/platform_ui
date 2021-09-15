import { NextApiRequest, NextApiResponse } from "next"
import Web3 from 'web3'
// 3rd Party
import differenceInSeconds from "date-fns/differenceInSeconds"
import BigNumber from "bignumber.js"
// CONTRACT
import { getContracts } from 'data/contracts'
import { servers } from 'utils/servers'
import { toWei } from 'web3-utils'

export default async function withdrawForUser( req: NextApiRequest, res: NextApiResponse){

  const bodyData: { amount?: number, account?: string, chain?: number } = JSON.parse(req.body || '{}')
  const { amount = 100, account = "0x7Ff20b4E1Ad27C5266a929FC87b00F5cCB456374", chain = 97 } = bodyData
  if(!bodyData.amount || !bodyData.account || !bodyData.chain)
    return res.status(400).send({ message: 'Invalid Request'})

  // SETUP BLOCKCHAIN
  const provider =  chain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-2-s3.binance.org:8545/'
  const web3 = new Web3( new Web3.providers.HttpProvider( provider ) )
  const setup = getContracts('liveWallet', chain )
  const contract = await new web3.eth.Contract( setup.abi, setup.address )
  // START BALANCE
  const ogBalance = await contract.methods.betAmounts(account).call()
  const lockDuration = await contract.methods.lockPeriod().call()
  const serverBalance = await fetch(`${servers[process.env.NODE_ENV]}/users/wallet/db/${account}`)
    .then( r => r.json() )
    .then( data =>  toWei( `${data.user_balance}` ) )
    .catch( e => {
      res.status(400).json({ message: 'Server Balance is not available'})
      return 'Error'
    })
  if( typeof(serverBalance) == 'string' ) return
  // CHECK WHICH AMOUNT IS MAX AMOUNT
  const timelockActive =  differenceInSeconds( new Date() , new Date( new BigNumber(ogBalance.lockTimeStamp).plus(lockDuration).times(1000).toNumber() )) > 0
  const maxWithdrawAmount =  timelockActive ? serverBalance : ogBalance 

  if( new BigNumber( amount ).isGreaterThan( new BigNumber(maxWithdrawAmount) ) )
    return res.status(400).send({ message: "Can't withdraw more than max amount available"})

  // Authorize Owner
  const ownerAccount = await web3.eth.accounts.privateKeyToAccount( process.env.OWNER_PKEY)
  const txData = await contract.methods.withdrawBetForUser(amount, account).encodeABI()
  const signedTx = await ownerAccount.signTransaction({
    to: setup.address,
    data: txData,
    gas: 20000000,
  })
  await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('receipt', r => console.log('onReceipt', r))
    .catch( e => console.log('error',e))

  // NEW BALANCE
  const newBalance = await contract.methods.balanceOf(account).call()
  res.send({ 
    account: ownerAccount.address,
    initBalance: ogBalance?.balance,
    updatedBalance: newBalance
  })
}