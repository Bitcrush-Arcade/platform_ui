import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
// Next
import Head from 'next/head'
import Image from 'next/image'
// Other
import BigNumber from 'bignumber.js'
import Countdown from 'react-countdown'
import { useWeb3React } from '@web3-react/core'
// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel';
// Material
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
// Bitcrush UI
import PageContainer from 'components/PageContainer'
// data
import { getContracts } from 'data/contracts'
// Hooks
import useCoin from 'hooks/useCoin'
import { useContract } from 'hooks/web3Hooks'
// Utils
import { currencyFormat } from 'utils/text/text'
import { toWei } from 'web3-utils'
import { useTransactionContext } from 'hooks/contextHooks'
// types
import type { Receipt } from 'types/PromiEvent'
import PresaleClaim from 'abi/PresaleClaim.json'

type PresaleDataType = {
  whitelisted: number,
  boughtAmount: BigNumber,
  maxRaise: BigNumber,
  totalRaised: BigNumber,
  claimable: BigNumber,
  claimed: BigNumber,
  totalBought: BigNumber,
  saleStart: BigNumber,
  saleEnd: BigNumber,
  hasToken: boolean,
  hasClaimed: boolean,
}
const initPresale = {
  whitelisted: 0,
  boughtAmount: new BigNumber(0),
  maxRaise: new BigNumber(1),
  totalRaised: new BigNumber(0),
  claimable: new BigNumber(0),
  claimed: new BigNumber(0),
  totalBought: new BigNumber(0),
  saleStart: new BigNumber(0),
  saleEnd: new BigNumber(0),
  hasToken: false,
  hasClaimed: false
}

const NiceSale = () =>
{
  const [ saleStarted, setSaleStarted ] = useState<boolean>(() => new Date().getTime() > 1645401600000)
  const [ saleEnded, setSaleEnded ] = useState<boolean>(() => new Date().getTime() > 1645401600000)
  const [ nftId, setNftId ] = useState<string>("")
  const [ buyAmount, setBuyAmount ] = useState<number>(0)
  const [ prequalified, setPrequalified ] = useState<boolean>(false)
  const { account, chainId } = useWeb3React()
  const { editTransactions } = useTransactionContext()

  const [ presaleData, setPresaleData ] = useState<PresaleDataType>(initPresale)

  const { abi: psAbi, address: presaleContract } = getContracts('presale', chainId)
  const busdContract = useMemo(() =>
  {
    switch (chainId) {
      case 56: //BSC Mainnet actual BUSD contract
        return "0xe9e7cea3dedca5984780bafc599bd69add087d56"
      case 97: // BSC Testnet using same as CRUSH
        return "0xa3ca5df2938126bae7c0df74d3132b5f72bda0b6"
      default:
        return null
    }
  }, [ chainId ])

  const { approve, getApproved, isApproved } = useCoin(busdContract || undefined)
  const { methods: psMethod } = useContract(psAbi, presaleContract)
  const { methods: psClaim } = useContract(PresaleClaim.abi, "0x6FFf3446F1AF60c0e9F62D4FeD67f6f9e2292Db5")

  const getPresaleData = useCallback(async () =>
  {
    if (!account || !psMethod) {
      console.log('do nothing1')
      return
    }
    const userData = await psMethod.userData().call({ from: account })
    const hasClaimed = await psClaim.claimedTokens(account).call()
    const maxRaise = new BigNumber(await psMethod.maxRaise().call())
    const totalRaised = new BigNumber(await psMethod.totalRaised().call())
    const saleStart = new BigNumber(await psMethod.saleStart().call()).times(1000)
    const isPause = await psMethod.pause().call()
    const token = await psMethod.niceToken().call()
    setSaleEnded(isPause)

    setPresaleData({
      whitelisted: 100,
      boughtAmount: new BigNumber(userData[ 0 ]),
      maxRaise,
      totalRaised,
      claimed: new BigNumber(userData[ 2 ]),
      claimable: isPause ? new BigNumber(10000) : new BigNumber(0),
      totalBought: new BigNumber(userData[ 1 ]),
      saleStart,
      saleEnd: new BigNumber(0),
      hasToken: parseInt(token) > 0,
      hasClaimed
    })
  }, [ setPresaleData, psMethod, account, psClaim ])

  const checkPreQ = useCallback(async () =>
  {
    if (!account || !psMethod) {
      console.log('do nothing2')
      return
    }
    const isPreQualified = await psMethod.qualify().call({ from: account }).catch((e: any) => { console.log('error on qualify', e); return false })
    console.log({ isPreQualified })
    setPrequalified(Boolean(isPreQualified))
  }, [ account, psMethod, setPrequalified ])

  useEffect(() =>
  {
    if (!busdContract || !account || !presaleContract) return
    getApproved(presaleContract)
  }, [ busdContract, account, presaleContract, getApproved ])

  useEffect(() =>
  {
    if (!account || !psMethod) return
    checkPreQ()
    getPresaleData()
    console.log('get data run')
    const interval = setInterval(() =>
    {
      console.log('get data run interval')
      checkPreQ()
      getPresaleData()
    }, 15000)
    return () =>
    {
      clearInterval(interval)
    }
  }, [ account, checkPreQ, psMethod, getPresaleData ])

  // const approveBUSD = () => {
  //   approve(presaleContract, new BigNumber(5000).times(10**18))
  // }

  const inputRef = useRef<HTMLInputElement>(null)

  // const buyTokens = () => {
  //   if(buyAmount > 5000 || buyAmount < 100 || isNaN(buyAmount)) return;
  //   psMethod.buyNice( new BigNumber(buyAmount).times(10**18).toFixed(0) ).send({from: account})
  //     .on("transactionHash", (tx: string) => {
  //       console.log('hash', tx )
  //       editTransactions(tx,"pending",{ description: `Buy ${buyAmount} worth of $NICE`})
  //     })
  //     .on("receipt", (rc: Receipt) => {
  //       console.log('receipt',rc)
  //       editTransactions(rc.transactionHash, 'complete')
  //       getPresaleData()
  //       setBuyAmount(0)
  //       if(inputRef.current)
  //         inputRef.current.value = ""
  //     })
  //     .on('error', (e: any, rc: Receipt)=>{
  //       console.log('error', e, rc)
  //       rc?.transactionHash && editTransactions(rc?.transactionHash, 'error', e)
  //     })

  // }
  1
  // const whitelist = () => {
  //   const tokenId = parseInt(inputRef.current?.value || '0')
  //   console.log({tokenId})
  //   if(isNaN(tokenId) || tokenId == 0 || !account ) 
  //     return;
  //   psMethod.whitelistSelf(tokenId).send({from: account})
  //     .on("transactionHash", (tx: string) => {
  //       console.log('hash', tx )
  //       editTransactions(tx,"pending",{ description: `#${tokenId} Whitelist Self`})
  //     })
  //     .on("receipt", (rc: Receipt) => {
  //       console.log('receipt',rc)
  //       editTransactions(rc.transactionHash, 'complete')
  //       getPresaleData()
  //     })
  //     .on('error', (e: any, rc: Receipt)=>{
  //       console.log('error', e, rc)
  //       rc?.transactionHash && editTransactions(rc?.transactionHash, 'error', e)
  //     })
  // }

  // const fillPercent = parseInt(presaleData.totalRaised.div( presaleData.maxRaise ).times(100).toFixed(0))

  const claimNice = () =>
  {
    psClaim.claimTokens().send({ from: account })
      .on("transactionHash", (tx: string) =>
      {
        console.log('hash', tx)
        editTransactions(tx, "pending", { description: `Claim $NICE Presale` })
      })
      .on("receipt", (rc: Receipt) =>
      {
        console.log('receipt', rc)
        editTransactions(rc.transactionHash, 'complete')
        getPresaleData()
        setBuyAmount(0)
        if (inputRef.current)
          inputRef.current.value = ""
      })
      .on('error', (e: any, rc: Receipt) =>
      {
        console.log('error', e, rc)
        rc?.transactionHash && editTransactions(rc?.transactionHash, 'error', e)
      })
  }

  return <>
    <Head>
      <title>$NICE Presale</title>
      <meta name="description" content="Sale for $NICE, the currency of the upcoming Invaderverse. Stay tuned for more details" />
      <meta name="author" content="Bitcrush" />
    </Head>
    <PageContainer background='galactic'>
      <div className="flex items-center justify-center px-2">
        {
          (!chainId || chainId !== 56)
            ?
            <h2 className='text-xl font-zeb mt-10'>
              Coming Soon
            </h2>
            :
            <>
              {/* PRESALE CARD CONTAINER */}
              <div className="flex-grow border-2 border-secondary rounded-[32px] p-5 bg-paper-bg inner-glow-secondary max-w-[450px] text-white mt-7">
                <div className="flex flex-row items-center justify-between">
                  <Image src={"/assets/glowy.png"} width={75} height={75} alt="Invaderverse Logo" className='min-w-[75px]' />
                  <h2 className="text-right font-bold text-xl font-zeb tracking-widest">
                    NICE Presale
                  </h2>
                </div>
                <div className="py-2">
                  <p className="text-justify text-sm">
                    $NICE is the official currency of the Invaderverse. Presale is open, you can participate.
                    <br />
                    Tokens are claimable immediately after sale ends.
                  </p>
                </div>
                {/* Fill bar */}
                {/* <div className="rounded-full overflow-hidden h-6 mb-2">
                    <progress id="raise_percent" value={fillPercent} max={100}
                      className="w-full h-6 rounded-full"
                    >
                      {fillPercent}%
                    </progress>
                  </div> */}
                {/* <div className='flex flex-row justify-between px-2'>
                    <label htmlFor="raise_percent">
                      Raise Amount:
                    </label>
                    <span>
                      {presaleData.totalRaised.div(10**18).toFixed(0)} / {presaleData.maxRaise.div(10**18).toFixed(0)}
                    </span>
                  </div> */}
                {/* <div className='flex flex-row justify-between px-2 mb-4'>
                    <p>
                      Do I qualify?
                    </p>
                    <Tooltip title="Everyone qualifies!">
                      <CheckCircleIcon color="secondary"/>
                    </Tooltip>
                  </div> */}
                <h3
                  className="text-center text-2xl font-zeb text-secondary"
                >
                  Pre-Sale Over
                </h3>
                {/* <div className='flex flex-row justify-center'>
                    {
                      isApproved ?
                        ( saleStarted && !saleEnded && <TextField 
                          type="number"
                          label="BUSD amount"
                          InputProps={{
                            sx:{
                              pr: 0,
                              color: 'white'
                            },
                            endAdornment: <button className="bg-primary px-2 w-[120px] h-full ml-2 text-sm hover:bg-primary-dark disabled:opacity-60 disabled:hover:bg-primary"
                              disabled={presaleData.boughtAmount.div(10**18).isGreaterThanOrEqualTo(5000) || presaleData.boughtAmount.div(10**18).plus(buyAmount).isGreaterThan(5000) || buyAmount < 100}
                              onClick={buyTokens}
                            >
                              Buy
                            </button>
                          }}
                          InputLabelProps={{
                            sx:{
                              color: theme => theme.palette.grey[300]
                            }
                          }}
                          onChange={ (e) => setBuyAmount( parseInt(e.target.value))}
                          error={buyAmount<100 || buyAmount > 5000}
                          helperText={!buyAmount && "No decimals" || buyAmount < 100 && "Min: BUSD 100" || buyAmount > 5000 && "Max: BUSD 5000" || " "}
                        />)
                      :
                        <button onClick={approveBUSD}
                          className='border-2 border-primary px-4 py-3 inner-glow-primary rounded-full hover:bg-primary hover:text-black focus:ring-2 focus:ring-secondary focus:outline-none'
                        >
                          Approve BUSD
                        </button>
                    }
                  </div> */}
                {/* COUNTDOWN FOR SALE START */}
                <hr className='my-3 border-primary opacity-70' />

                {/* {
                    !saleStarted && 
                      <Countdown date={new Date(presaleData.saleStart.toNumber() || 1645401600000)}
                        onComplete={()=>setSaleStarted(true)}
                        renderer={
                          ({days, hours, minutes, seconds, completed}) => {
                            if(completed) return null
                            return <h3 className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                                <span>
                                  Sale Start <strong className="text-primary">Mon Feb 21st 00 UTC</strong>
                                </span>
                                <span className="text-secondary font-bold">
                              {days && `${days}D`} {hours && `${hours}H`} {minutes && `${minutes}M`} {seconds}S
                              </span>
                            </h3>
                          }
                        }
                      />
                  }
                  {
                    saleStarted && 
                      <Countdown date={new Date(presaleData.saleEnd.toNumber())}
                        onComplete={()=>setSaleEnded(true)}
                        renderer={
                          ({days, hours, minutes, seconds, completed}) => {
                            if(completed) return null
                            return <h3 className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                                <span>
                                  Sale Ends <strong className='text-secondary'>Thur Feb 24st 00 UTC</strong>
                                </span>
                                <span className="text-secondary font-bold">
                              {days && `${days}D`} {hours && `${hours}H`} {minutes && `${minutes}M`} {seconds}S
                              </span>
                            </h3>
                          }
                        }
                      />
                  }
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>To Raise (BUSD)</span>
                    <span>{currencyFormat(presaleData.maxRaise.toString(), {decimalsToShow: 0, isWei: true})}</span>
                  </div>
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>Presale Price (NICE/BUSD)</span>
                    <span>0.00470</span>
                  </div> */}
                {saleStarted && <>
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>$BUSD Spent</span>
                    <span>{currencyFormat(presaleData.boughtAmount.toString(), { decimalsToShow: 0, isWei: true })}</span>
                  </div>
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>$NICE Bought</span>
                    <span
                      className="text-primary"
                    >
                      {currencyFormat(presaleData.totalBought.toString(), { decimalsToShow: 0, isWei: true })}
                    </span>
                  </div>
                  {presaleData.claimable.isGreaterThan(0) &&
                    <>
                      <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                        <span>{presaleData.hasClaimed ? "CLAIMED" : "Claimable"}</span>
                        <span>{presaleData.hasToken ? "YES" : "NO"}</span>
                      </div>
                      {/* <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                          <span>$NICE Claimable</span>
                          <span>{currencyFormat(presaleData.claimable.div(10000).times(presaleData.totalBought).toString(),{decimalsToShow: 0, isWei: true})}</span>
                        </div> */}
                      {/* <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                          <span>Claimed</span>
                          <span>{currencyFormat(presaleData.claimed.div(100).toString(),{decimalsToShow: 0})}%</span>
                        </div>
                        <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                          <span>$NICE Claimed</span>
                          <span>{currencyFormat(presaleData.claimed.div(100).times(presaleData.totalBought).toString(),{decimalsToShow: 0})}</span>
                        </div> */}
                      {
                        !presaleData.hasClaimed &&
                        <div className="flex justify-center">
                          <button
                            disabled={!presaleData.hasToken || presaleData.hasClaimed}
                            className={`
                                  disabled:opacity-60 disabled:bg-primary-dark disabled:hover:text-white
                                  border-primary border-2 inner-glow-primary px-6 py-2 rounded-full
                                  hover:bg-primary-dark hover:text-black
                                `}
                            onClick={claimNice}
                          >
                            {presaleData.hasToken ? "Claim Now" : "Coming soon"}
                          </button>
                        </div>
                      }
                    </>
                  }
                </>}
              </div>
            </>
        }
      </div>
    </PageContainer>
  </>
}

export default NiceSale