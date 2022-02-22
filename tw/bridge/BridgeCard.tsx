import React, { useState, useCallback, ChangeEvent } from 'react'
import Image from 'next/image'
// Bitcrush UI
// Hooks
import { imageBuilder } from 'utils/sanityConfig'
import { useAuthContext } from 'hooks/contextHooks'

// MUI
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

// Props
type BridgeCardProps = {
  bridgeChains: Array<any>
}

const BridgeCard = (props: BridgeCardProps) => {

  const { bridgeChains } = props

  const { login, account, chainId } = useAuthContext()
  const [selectedToken, setSelectedToken] = useState<boolean>(false)
  const [fromChain, setFromChain] = useState<any>()
  const [toChain, setToChain] = useState<any>()

  
  const tokenToggle= useCallback(() => {
    setSelectedToken( p => !p)
  },[setSelectedToken])
  
  return <div className="flex flex-col gap-10 border-2 border-secondary inner-glow-secondary bg-paper-bg px-12 pt-1 pb-10 rounded-[32px] max-w-[500px]">
            
            <div className="grid grid-col grid-cols-3 grid-rows-2 justify-items-center items-center">

              <h2 className="text-s self-end col-start-1">
                FROM 
              </h2>

              <h2 className="text-primary row-start-1 col-start-2 self-center">
                  Select chains
              </h2>

              <h2 className="text-s self-end col-start-3">
                  TO 
              </h2>

              <div className="col-start-1 grid justify-items-center">
                <ChainSelector allChains={bridgeChains}/>
              </div>

              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 col-start-2 col-span-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>

              <div className="col-start-3 grid justify-items-center">
                <ChainSelector allChains={bridgeChains}/> 
              </div>
            </div>
          

          <div className="flex flex-col justify-items-center items-center gap-3">

            <h2 className="text-primary">
              Select token
            </h2>

            {
              selectedToken
                ?

                <div className="grid grid-cols-3 justify-items-stretch items-center gap-2">
                  <h2 className="justify-self-end text-s">
                    NICE
                  </h2>
                  <button onClick={tokenToggle} className="justify-self-center flex flex-row border-2 border-primary rounded-[32px] w-20 p-1">
                    <div className="flex flex-row border-4 border-primary bg-primary rounded-[32px] basis-1/2 px-2 h-6 w-10"/>
                  </button>
                  <h2 className='text-xs text-slate-500'>
                    CRUSH
                  </h2>
                </div>
                :
                <div className="grid grid-cols-3 justify-items-stretch items-center gap-2">
                  <h2 className="text-xs justify-self-end text-slate-500">
                    NICE
                  </h2>
                  <button onClick={tokenToggle} className="justify-self-center flex flex-row justify-end border-2 border-primary rounded-[32px] w-20 p-1">
                    <div className="basis-1/2 flex flex-row border-4 border-primary bg-primary rounded-[32px] px-2 h-6 w-10"/>
                  </button>
                  <h2 className="text-s">
                    CRUSH
                  </h2>
                </div>
            }

            <div>
              <h2 className="text-xs text-primary">
                Amount to bridge
              </h2>
              <input
                className="
                  w-full
                  px-3
                  py-1.5
                  text-base
                  font-normal
                  text-white
                  bg-paper-bg bg-clip-padding
                  border-2 border-solid border-primary
                  rounded-[8px]
                  transition
                  ease-in-out
                  m-0
                  focus:text-white focus:bg-paper-bg focus:outline-none 
                "
                id="coinAmount"
                placeholder="0.0"
                //value={bridgeAmount}
                onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
                  // get value
                  // change to BIGNUMBER
                  // CHECK IF NUMBER IS VALID
                  // SET STATE
                }}
              />
            </div>
          </div>
          <div className="flex justify-center">
            {
              account
                ?
              <button disabled={false} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-6 py-4 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold">
                  BRIDGE TOKENS
                </span>
              </button>
              :
              <button className="flex flex-row items-center gap-2 border-2 border-primary inner-glow-primary px-6 py-4 text-xs rounded-full hover:bg-primary hover:text-black" onClick={login}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                CONNECT TO WALLET
              </button>
            }
          </div>

          <div className="flex border-2 border-primary rounded-[32px] justify-center mx-2 p-4">
            <h2 className="text-center text-m whitespace-pre-line">
              CAPTION DATA{'\n'}
              <span className="text-s">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy text 
                ever since the 1500s, when an unknown printer took a galley of type
                and scrambled it to make a type specimen book. 
              </span>
            </h2>
          </div>
    </div>
}

export default BridgeCard

type SelectorProps = {
  onChange:(chainToSelect: string) => void,
  currentChain: string
  defaultChain: string,
  allChains: Array<any>
}
const ChainSelector = (props: SelectorProps) => {

  const { allChains, currentChain } = props
  const [chain, setChain] = React.useState('');
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChain(event.target.value);
  };

  return <div>
    <Select
      id="chain-select"
      value={chain}
      onChange={handleChange}
      defaultValue={"?"}
      sx={{
        width: "10rem",
        height: "81px",
        borderRadius: "8px",
      }}
    >
      { 
        allChains.map((chainInfo, cIndex) => {
          return <MenuItem value={cIndex} disabled={chainInfo.symbol == chain}>
            <div className="flex flex-row justify-center items-center gap-4 p-1">
            {chainInfo.chainIcon?.asset._ref && <Image src={imageBuilder(chainInfo.chainIcon.asset._ref).width(40).height(40).url()} width={40} height={40}/>}
            {chainInfo.symbol}
            </div>
          </MenuItem>
        })
      }
    </Select>
  </div>
}

