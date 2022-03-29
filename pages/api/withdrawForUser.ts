import { NextApiRequest, NextApiResponse } from "next"
import Web3 from 'web3'
// 3rd Party
import differenceInSeconds from "date-fns/differenceInSeconds"
import BigNumber from "bignumber.js"
// CONTRACT
import { getContracts } from 'data/contracts'
import { servers } from 'utils/servers'
import { toWei } from 'web3-utils'
import logger from 'utils/logger'

BigNumber.config({ DECIMAL_PLACES: 18 })

export default async function withdrawForUser(req: NextApiRequest, res: NextApiResponse)
{

  return;
  const bodyData: { amount?: number, account?: string, chain?: number } = JSON.parse(req.body || '{}')
  const { amount, account, chain } = bodyData
  const logdata: any = { ...bodyData }
  chain == 56 && console.log('Requester', { amount, account })
  if (!amount || !account || !chain)
    return res.status(400).send({ message: 'Invalid Request' })

  const host = req.headers.host
  const isLocal = (host || '').indexOf('localhost:') > -1

  const lock = await fetch(`http${isLocal ? '' : 's'}://${host}/api/db/play_timelock_active`, {
    method: 'POST',
    body: JSON.stringify({ account: account })
  }).then(r => r.json())
  console.log('lock status', lock.lockWithdraw)
  logdata.lock = lock.lockWithdraw
  if (lock.lockWithdraw) {
    logger.info(logdata)
    res.status(200).json({ message: 'Withdraw locked for 90 secs, please try later', timelock: lock.lockWithdraw })
    return
  }

  // SETUP BLOCKCHAIN
  const provider = chain == 56 ? 'https://bsc-dataseed1.defibit.io/' : 'https://data-seed-prebsc-2-s3.binance.org:8545/'
  const web3 = new Web3(new Web3.providers.HttpProvider(provider))
  const setup = getContracts('liveWallet', chain)
  if (!setup.abi)
    return res.status(400).json({ error: 'No abi for contract' })
  const contract = await new web3.eth.Contract(setup.abi, setup.address)
  // START BALANCE
  const ogBalance = await contract.methods.betAmounts(account).call()
  const lockDuration = await contract.methods.lockPeriod().call()
  const serverBalance = await fetch(`${servers[ process.env.NODE_ENV === "production" ? "production" : "development" ]}/api/users/wallet/${account}`, {
    headers: {
      origin: "http://localhost:3000"
    }
  })
    .then(r => r.json())
    .then(data => parseInt(toWei(`${new BigNumber(data.balance).toFixed(18, 1)}`)))
    .catch(e =>
    {
      logger.error({ error: e, logdata }, 'Server Balance is not available')
      res.status(400).json({ message: 'Server Balance is not available', error: e })
      return 'Error'
    })
  if (typeof (serverBalance) == 'string') return
  // CHECK WHICH AMOUNT IS MAX AMOUNT
  const timelockActive = differenceInSeconds(new Date(), new Date(new BigNumber(ogBalance.lockTimeStamp).plus(lockDuration).times(1000).toNumber())) > 0
  const maxWithdrawAmount = timelockActive ? serverBalance : ogBalance.balance
  logdata.amounts = { serverBalance, ogBalance: new BigNumber(ogBalance.balance).div(10 ** 18).toFixed(18, 1) }
  if (new BigNumber(amount).isGreaterThan(new BigNumber(maxWithdrawAmount))) {
    logger.error(logdata, 'Server Balance is not available')
    return res.status(400).send({ error: "Can't withdraw more than max amount available" })
  }

  // Authorize Owner
  const ownerAccount = await web3.eth.accounts.privateKeyToAccount(process.env.OWNER_PKEY || '')
  const txData = await contract.methods.withdrawBetForUser(amount, account).encodeABI()
  const signedTx = await ownerAccount.signTransaction({
    to: setup.address,
    data: txData,
    gas: 20000000,
  })

  let hashSent = false
  if (!signedTx.rawTransaction)
    return res.status(400).json({ error: 'no transaction to sign' })
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('transactionHash', tx =>
    {
      logger.info({ logdata, tx }, "success in creating hash")
      res.status(200).send({ txHash: tx })
      hashSent = true
    })
    .catch(e =>
    {
      console.log('error', e)
      !hashSent && res.status(400).send({ error: 'Something went wrong with the transaction' })
    })
}