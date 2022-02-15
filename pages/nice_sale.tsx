import { useMemo, useState, useEffect, useRef, useCallback   } from 'react'
// Next
import Head from 'next/head'
import Image from 'next/image'
// Other
import Countdown from 'react-countdown'
// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel';
// Material
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
// Bitcrush UI
import PageContainer from 'components/PageContainer'
import useCoin from 'hooks/useCoin'

import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { getContracts } from 'data/contracts'
import { useContract } from 'hooks/web3Hooks'
// Utils
import { currencyFormat } from 'utils/text/text'
import { toWei } from 'web3-utils'

const NiceSale = () => {
  const [totalRaised, setTotalRaised] = useState<BigNumber>( new BigNumber(0) )
  const [fillPercent, setFillPercent] = useState<number>(50);
  const [nftId, setNftId] = useState<string>("")
  const [buyAmount, setBuyAmount] = useState<number>(0)
  const [prequalified, setPrequalified] = useState<boolean>(false)
  const {account, chainId} = useWeb3React()

  const [presaleData, setPresaleData] = useState<{whitelisted: number}>({whitelisted: 0})

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
    if(!account) return
    
  },[setPresaleData, psMethod, account])

  const checkPreQ = useCallback( async () => {
    if(!account || !psMethod) return
    const isPreQualified = await psMethod.qualify().call({from: account})
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
  },[account, checkPreQ, psMethod])

  const approveBUSD = () => {
    approve(presaleContract, new BigNumber(5000).times(10^18))
  }

  const inputRef=useRef<HTMLInputElement>(null)

  const buyTokens = () => {
    console.log({buyAmount})
  }
1
  const whitelist = () => {
    const tokenId = parseInt(inputRef.current?.value || '0')
    console.log({tokenId})
    if(isNaN(tokenId) || tokenId == 0) return

  }
  return <>
    <Head>
      <title>$NICE Presale</title>
      <meta name="description" content="Sale for $NICE, the currency of the upcoming Invaderverse. Stay tuned for more details"/>
      <meta name="author" content="Bitcrush"/>
    </Head>
    <PageContainer background='galactic'>
      <div className="flex items-center justify-center px-2">
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
              {totalRaised.toString()} / 125,000
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
                <Tooltip title={<p className="whitespace-pre-line">
                    Check that you:{"\n"}
                    * Own a Crush God NFT{"\n"}
                    * Have at least 10k $CRUSH staked in Auto Bitcrush V2{"\n"}
                  </p>
                }>
                  <CancelIcon color="error"/>
                </Tooltip>
            }
          </div>
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
                <div className='flex items-center gap-x-1'>
                  <TextField
                    size="small"
                    value={nftId}
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
                    className="border-2 border-secondary px-3 py-1 inner-glow-secondary text-xs rounded-full hover:bg-secondary hover:text-black max-w-[8em] disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
                  >
                    WHITELIST ME
                  </button>
                </div>
            }
          </div>
          {/* Approve and BUY */}
          <div className='flex flex-row justify-center mt-4'>
            {
              isApproved ?
                <TextField 
                  type="number"
                  label="BUSD amount"
                  InputProps={{
                    style:{ paddingRight: 0},
                    endAdornment: <button className="bg-primary px-2 w-[120px] h-full ml-2 text-sm hover:bg-primary-dark" 
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
          {/* COUNTDOWN FOR SALE START */}

          <h3 className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
            <span>
              Sale Start
            </span>
            <span className="text-secondary font-bold">
              <Countdown date={new Date(1645333200000)}
                renderer={
                  ({days, hours, minutes, seconds}) => {
                    return <>
                      {days}D {hours}H {minutes}H {seconds}S
                    </>
                  }
                }
              />
            </span>
          </h3>
          <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
            <span>Bought</span>
            <span>{currencyFormat(0, {decimalsToShow: 0})}</span>
          </div>
          <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
            <span>To Raise (BUSD)</span>
            <span>{currencyFormat(125000, {decimalsToShow: 0})}</span>
          </div>
          <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
            <span>Presale Price (NICE/BUSD)</span>
            <span>0.00470</span>
          </div>
          <div className='text-lg px-1 flex flex-row justify-between text-[0.9em]'>
            <span>Title</span>
            <span>Detail</span>
          </div>
        </div>
      </div>
    </PageContainer>
  </>
}

export default NiceSale