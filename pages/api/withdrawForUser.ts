import { NextApiRequest, NextApiResponse } from "next"
import Web3 from 'web3'
// 3rd Party
import differenceInSeconds from "date-fns/differenceInSeconds"
import BigNumber from "bignumber.js"
// CONTRACT
import { getContracts } from 'data/contracts'
import { servers } from 'utils/servers'
import { toWei } from 'web3-utils'

BigNumber.config({ DECIMAL_PLACES: 18 })

export default async function withdrawForUser( req: NextApiRequest, res: NextApiResponse){

  const bodyData: { amount?: number, account?: string, chain?: number } = JSON.parse(req.body || '{}')
  const { amount, account, chain } = bodyData
  if(!amount || !account || !chain)
    return res.status(400).send({ message: 'Invalid Request'})

  const host = req.headers.host
  const isLocal = host.indexOf('localhost:') > -1

  const lock = await fetch(`http${isLocal ? '' : 's'}://${host}/api/db/play_timelock_active`,{
    method: 'POST',
    body: JSON.stringify({ account: account })
  }).then( r => r.json() )

  if(lock.lockWithdraw){
    res.status(200).json({ message: 'Withdraw locked for 90 secs, please try later', timelock: lock.lockWithdraw })
    return
  }

  // SETUP BLOCKCHAIN
  const provider =  chain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-2-s3.binance.org:8545/'
  const web3 = new Web3( new Web3.providers.HttpProvider( provider ) )
  const setup = getContracts('liveWallet', chain )
  const contract = await new web3.eth.Contract( setup.abi, setup.address )
  // START BALANCE
  const ogBalance = await contract.methods.betAmounts(account).call()
  const lockDuration = await contract.methods.lockPeriod().call()
  const serverBalance = await fetch(`${servers[ process.env.NODE_ENV ]}/api/users/wallet/${account}`,{
    headers:{
      origin: "http://localhost:3000"
    }
  })
    .then( r => r.json() )
    .then( data =>  parseInt(toWei(`${data.user_balance}`)) )
    .catch( e => {
      res.status(400).json({ message: 'Server Balance is not available', error: e})
      return 'Error'
    })
  if( typeof(serverBalance) == 'string' ) return
  // CHECK WHICH AMOUNT IS MAX AMOUNT
  const timelockActive =  differenceInSeconds( new Date() , new Date( new BigNumber(ogBalance.lockTimeStamp).plus(lockDuration).times(1000).toNumber() )) > 0
  const maxWithdrawAmount =  timelockActive ? serverBalance : ogBalance.balance 

  if( new BigNumber( amount ).isGreaterThan( new BigNumber(maxWithdrawAmount) ) )
    return res.status(400).send({ error: "Can't withdraw more than max amount available"})

  // Authorize Owner
  const ownerAccount = await web3.eth.accounts.privateKeyToAccount( process.env.OWNER_PKEY)
  const txData = await contract.methods.withdrawBetForUser(amount, account).encodeABI()
  const signedTx = await ownerAccount.signTransaction({
    to: setup.address,
    data: txData,
    gas: 20000000,
  })

  let hashSent = false

    return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on( 'transactionHash', tx => {
      res.status(200).send({ txHash: tx})
      hashSent = true
    })
    .catch( e => {
      console.log('error',e)
      !hashSent && res.status(400).send({ error: 'Something went wrong with the transaction'})
    })  
}