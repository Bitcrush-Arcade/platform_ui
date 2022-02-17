import { useMemo, useState, useEffect, useRef, useCallback   } from 'react'
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
}

const NiceSale = () => {
  const [saleStarted, setSaleStarted] = useState<boolean>(() => new Date().getTime() > 1645401600000)
  const [saleEnded, setSaleEnded] = useState<boolean>(() => new Date().getTime() > 1645401600000)
  const [nftId, setNftId] = useState<string>("")
  const [buyAmount, setBuyAmount] = useState<number>(0)
  const [prequalified, setPrequalified] = useState<boolean>(false)
  const {account, chainId} = useWeb3React()
  const { editTransactions } = useTransactionContext()

  const [presaleData, setPresaleData] = useState<PresaleDataType>(initPresale)

  const { abi: psAbi, address: presaleContract} = getContracts('presale', chainId)
  const busdContract = useMemo(()=> {
    switch(chainId){
      case 56: //BSC Mainnet actual BUSD contract
        return "0xe9e7cea3dedca5984780bafc599bd69add087d56"
      case 97: // BSC Testnet using same as CRUSH
        return "0xa3ca5df2938126bae7c0df74d3132b5f72bda0b6"
      default: 
        return null
    }
  },[chainId])

  const { approve, getApproved, isApproved } = useCoin(busdContract || undefined)
  const { methods: psMethod } = useContract(psAbi, presaleContract)

  const getPresaleData = useCallback(async() => {
    if(!account || !psMethod){
      console.log('do nothing1')
      return
    }
    const userData = await psMethod.userBought(account).call()
    const tokenUsed = await psMethod.whitelist(account).call()
    const maxRaise = new BigNumber( await psMethod.maxRaise().call() )
    const totalRaised = new BigNumber( await psMethod.totalRaised().call() )
    const available = new BigNumber(await psMethod.availableAmount().call())
    const saleStart = new BigNumber(await psMethod.availableAmount().call())
    const saleEnd = new BigNumber(await psMethod.availableAmount().call())

    setPresaleData({
      whitelisted: tokenUsed,
      boughtAmount: new BigNumber(userData.amountBought),
      maxRaise,
      totalRaised,
      claimed: new BigNumber(userData.amountClaimed),
      claimable: available.minus(userData.amountClaimed),
      totalBought: new BigNumber(userData.amountOwed),
      saleStart,
      saleEnd
    })
  },[setPresaleData, psMethod, account])

  const checkPreQ = useCallback( async () => {
    if(!account || !psMethod){
      console.log('do nothing2')
      return
    }
    const isPreQualified = await psMethod.qualify().call({from: account}).catch( (e: any) => { console.log('error on qualify', e); return false})
    console.log({isPreQualified})
    setPrequalified(Boolean(isPreQualified))
  },[account, psMethod, setPrequalified])
  
  useEffect( () => {
    if(!busdContract || !account || !presaleContract) return
    getApproved(presaleContract)
  },[busdContract, account, presaleContract, getApproved])

  useEffect( () => {
    if(!account || !psMethod) return
    checkPreQ()
    getPresaleData()
    console.log('get data run')
    const interval = setInterval(() => {
      console.log('get data run interval')
      checkPreQ()
      getPresaleData()
    }, 15000)
    return ()=>{
      clearInterval(interval)
    }
  },[account, checkPreQ, psMethod, getPresaleData])

  const approveBUSD = () => {
    approve(presaleContract, new BigNumber(5000).times(10**18))
  }

  const inputRef=useRef<HTMLInputElement>(null)

  const buyTokens = () => {
    if(buyAmount > 5000 || buyAmount < 100 || isNaN(buyAmount)) return;
    psMethod.buyNice( new BigNumber(buyAmount).times(10**18).toFixed(0) ).send({from: account})
      .on("transactionHash", (tx: string) => {
        console.log('hash', tx )
        editTransactions(tx,"pending",{ description: `Buy ${buyAmount} worth of $NICE`})
      })
      .on("receipt", (rc: Receipt) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash, 'complete')
        getPresaleData()
        setBuyAmount(0)
        if(inputRef.current)
          inputRef.current.value = ""
      })
      .on('error', (e: any, rc: Receipt)=>{
        console.log('error', e, rc)
        rc?.transactionHash && editTransactions(rc?.transactionHash, 'error', e)
      })

  }
1
  const whitelist = () => {
    const tokenId = parseInt(inputRef.current?.value || '0')
    console.log({tokenId})
    if(isNaN(tokenId) || tokenId == 0 || !account ) 
      return;
    psMethod.whitelistSelf(tokenId).send({from: account})
      .on("transactionHash", (tx: string) => {
        console.log('hash', tx )
        editTransactions(tx,"pending",{ description: `#${tokenId} Whitelist Self`})
      })
      .on("receipt", (rc: Receipt) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash, 'complete')
        getPresaleData()
      })
      .on('error', (e: any, rc: Receipt)=>{
        console.log('error', e, rc)
        rc?.transactionHash && editTransactions(rc?.transactionHash, 'error', e)
      })
  }

  const fillPercent = parseInt(presaleData.totalRaised.div( presaleData.maxRaise ).times(100).toFixed(0))

  const claimNice = () => {
    psMethod.claimTokens().send({from: account})
      .on("transactionHash", (tx: string) => {
        console.log('hash', tx )
        editTransactions(tx,"pending",{ description: `Claim $NICE Presale`})
      })
      .on("receipt", (rc: Receipt) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash, 'complete')
        getPresaleData()
        setBuyAmount(0)
        if(inputRef.current)
          inputRef.current.value = ""
      })
      .on('error', (e: any, rc: Receipt)=>{
        console.log('error', e, rc)
        rc?.transactionHash && editTransactions(rc?.transactionHash, 'error', e)
      })
  }


  return <>
    <Head>
      <title>$NICE Presale</title>
      <meta name="description" content="Sale for $NICE, the currency of the upcoming Invaderverse. Stay tuned for more details"/>
      <meta name="author" content="Bitcrush"/>
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
                    <Image src={"/assets/glowy.png"} width={75} height={75} alt="Invaderverse Logo" className='min-w-[75px]'/>
                    <h2 className="text-right font-bold text-xl font-zeb tracking-widest">
                      NICE Presale
                    </h2>
                  </div>
                  <div className="py-2">
                    <p className="text-justify text-sm">
                      $NICE is the official currency of the Invaderverse. Presale is by whitelist only, you can whitelist yourself if you meet the requirements listed below.
                    </p>
                  </div>
                  {/* Fill bar */}
                  <div className="rounded-full overflow-hidden h-6 mb-2">
                    <progress id="raise_percent" value={fillPercent} max={100}
                      className="w-full h-6 rounded-full"
                    >
                      {fillPercent}%
                    </progress>
                  </div>
                  <div className='flex flex-row justify-between px-2'>
                    <label htmlFor="raise_percent">
                      Raise Amount:
                    </label>
                    <span>
                      {presaleData.totalRaised.div(10**18).toFixed(0)} / {presaleData.maxRaise.div(10**18).toFixed(0)}
                    </span>
                  </div>
                  <div className='flex flex-row justify-between px-2'>
                    <p>
                      Do I qualify?
                    </p>
                    {
                      prequalified 
                      ?
                        <Tooltip title="All requirements met">
                          <CheckCircleIcon color="secondary"/>
                        </Tooltip>
                      :
                        <Tooltip title={
                          <p className="whitespace-pre-line">
                            Check that you:{"\n"}
                            * Own a Crush God NFT{"\n"}
                            * Have at least 10k $CRUSH staked in Auto Bitcrush V2{"\n"}
                          </p>
                        }>
                          <CancelIcon color="error"/>
                        </Tooltip>
                    }
                  </div>
                  {
                    prequalified && 
                    <div className='flex flex-col md:flex-row justify-between items-center px-2 py-2'>
                      <p className='mb-2'>
                        Am I whitelisted?
                      </p>
                      {
                        presaleData.whitelisted > 0
                        ?
                          <Tooltip title={`Whitelisted with NFT ID ${presaleData.whitelisted}`}>
                            <CheckCircleIcon color="secondary"/>
                          </Tooltip>
                        :
                          <Tooltip title={<p className="whitespace-pre-line">
                                Not whitelisted yet:{"\n"}
                                * Register your NFT ID{"\n"}
                                * If it fails, make sure your ID has not been registered before{"\n"}
                              </p>
                            }>
                            <CancelIcon color="error"/>
                          </Tooltip>
                      }
                    </div>
                  }
                  { 
                    prequalified && presaleData.whitelisted == 0 && 
                      <div className='flex items-center justify-center gap-x-1'>
                        <TextField
                          size="small"
                          value={nftId}
                          inputRef={inputRef}
                          onChange={(e) => {
                            const selectedId = parseInt(e.target.value)
                            if(e.target.value == ""){
                              setNftId("")
                              return
                            }
                            if(isNaN(selectedId)) return
                            setNftId(e.target.value)
                          }}
                          label="NFT ID"
                          className="max-w-[80px]"
                        />
                        <button disabled={isNaN(parseInt(nftId))}
                          onClick={whitelist}
                          className="border-2 border-secondary px-3 py-1 inner-glow-secondary text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
                        >
                          WHITELIST ME
                        </button>
                      </div>
                  }
                  {/* Approve and BUY */}
                  {
                    presaleData.whitelisted > 0 && 
                      <div className='flex flex-row justify-center'>
                        {
                          isApproved ?
                            <TextField 
                              type="number"
                              label="BUSD amount"
                              InputProps={{
                                style:{ paddingRight: 0},
                                endAdornment: <button className="bg-primary px-2 w-[120px] h-full ml-2 text-sm hover:bg-primary-dark disabled:opacity-60 disabled:hover:bg-primary"
                                  disabled={presaleData.boughtAmount.div(10**18).isGreaterThanOrEqualTo(5000) || presaleData.boughtAmount.div(10**18).plus(buyAmount).isGreaterThanOrEqualTo(5000) || buyAmount < 100}
                                  onClick={buyTokens}
                                >
                                  Buy
                                </button>
                              }}
                              onChange={ (e) => setBuyAmount( parseInt(e.target.value))}
                              error={buyAmount<100 || buyAmount > 5000}
                              helperText={!buyAmount && "No decimals" || buyAmount < 100 && "Min: BUSD 100" || buyAmount > 5000 && "Max: BUSD 5000" || " "}
                            />
                          :
                            <button onClick={approveBUSD}
                              className='border-2 border-primary px-4 py-3 inner-glow-primary rounded-full hover:bg-primary hover:text-black focus:ring-2 focus:ring-secondary focus:outline-none'
                            >
                              Approve BUSD
                            </button>
                        }
                      </div>
                  }
                  {/* COUNTDOWN FOR SALE START */}
                  <hr className='my-3 border-primary opacity-70'/>

                      <Countdown date={new Date(presaleData.saleStart.toNumber() || 1645401600000)}
                        onComplete={()=>setSaleStarted(true)}
                        renderer={
                          ({days, hours, minutes, seconds, completed}) => {
                            if(completed) return null
                            return <h3 className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                                <span>
                                  Sale Start
                                </span>
                                <span className="text-secondary font-bold">
                              {days}D {hours}H {minutes}H {seconds}S
                              </span>
                            </h3>
                          }
                        }
                      />
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>To Raise (BUSD)</span>
                    <span>{currencyFormat(presaleData.maxRaise.toString(), {decimalsToShow: 0, isWei: true})}</span>
                  </div>
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>Presale Price (NICE/BUSD)</span>
                    <span>0.00470</span>
                  </div>
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>BUSD Bought</span>
                    <span>{currencyFormat(presaleData.boughtAmount.toString(), {decimalsToShow: 0, isWei: true})}</span>
                  </div>
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>$NICE Bought</span>
                    <span
                      className="text-primary"
                    >
                      {currencyFormat(presaleData.totalBought.toString(), { decimalsToShow: 0, isWei: true})}
                    </span>
                  </div>
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>Claimable</span>
                    <span>{currencyFormat(presaleData.claimable.div(100).toString(),{decimalsToShow: 0})}%</span>
                  </div>
                  <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
                    <span>Claimed</span>
                    <span>{currencyFormat(presaleData.claimed.div(100).toString(),{decimalsToShow: 0})}%</span>
                  </div>
                  { presaleData.claimable.isGreaterThan(0) && 
                    <div className="flex justify-center">
                      <button
                        className={`
                          border-primary border-2 inner-glow-primary px-6 py-2 rounded-full
                          hover:bg-primary-dark hover:text-black
                        `}
                        onClick={claimNice}
                      >
                        Claim
                      </button>
                    </div>
                  }
                </div>
              </>
            }
      </div>
    </PageContainer>
  </>
}

export default NiceSale