import { useState } from 'react'
// Bitcrush UI
// COMPONENTS
import StakeModal from "components/basics/StakeModal"
// utils
import { currencyFormat } from "utils/text/text"

type FarmCardProps = {
  themeColor: string
}

const FarmCard = () => {

  return <div className="grid text-sm grid-col justify-items-stretch gap-2 p-8 m-3 border-2 border-primary inner-glow-primary bg-paper-bg rounded-[32px] w-[19rem] text-white">
          
          <div className="flex justify-between">
            <div>
              COIN ARTS
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-[1.5rem] font-bold">
                NICE-BNB
              </div>
              <div className="flex flex-row gap-1">
                <div className="border-2 border-secondary rounded-full px-2 py-1 text-sm text-secondary">
                  NO FEES 
                </div>
                <div className="border-2 border-secondary rounded-full px-2 py-1 text-sm text-secondary">
                  40X
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-between mt-4">
            <div className="text-primary">
              APR:
            </div> 
            <div className="font-bold">
              250 %
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-primary">
              EARN:
            </div>
            <div className="font-bold"> 
              NICE+FEES
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-primary">
              DEPOSIT FEE:
            </div>
            <div className="font-bold"> 
              0.1 %
            </div>
          </div>

            <div>
              <div className="form-label inline-block text-primary text-xs font-bold">
                  NICE EARNED: 
              </div>
              <div className="flex justify-between">
                <div className="text-4xl">
                  0.0
                </div>
                <button disabled={false} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-4 py-2 text-xs rounded-[8px] hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
                  HARVEST
                </button>
              </div>
            </div>

          <div>
            <div className="form-label inline-block text-primary text-xs pl-1 font-bold">
              NICE-BNB LP STAKED
            </div>
            <div className="flex justify-between">
              <input
                type="text"
                className="
                  px-3 py-1.5
                  bg-paper-bg
                  border-2 border-secondary 
                  rounded-[8px]
                  text-slate-500
                  max-w-[8rem]
                "
                id="amountEarned"
                value="0.0"
                aria-label="readonly amount earned"
                readOnly
              />
              <button disabled={false} className="flex flex-row items-center border-2 border-secondary inner-glow-secondary px-4 py-2 text-xs rounded-[8px] hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
                    STAKE
              </button>
            </div>  
          </div>

          
          <button disabled={false} className="flex flex-row justify-self-center items-center gap-2 border-2 border-secondary inner-glow-secondary px-6 py-4 my-4 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            ENABLE CONTRACT
          </button>

          <hr className="border-slate-500"/>

          <div className="flex gap-1 justify-self-center items-center text-secondary text-xs">
            HIDE
            <button disabled={false} className="hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"> 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 pb-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-between mt-2">
            <div className="text-primary">
              DEPOSIT:
            </div> 
            <div className="flex gap-1 items-center font-bold">
              NICE-BNB LP
              <button disabled={false} className="text-primary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"> 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            </div>
          </div>

          <div className="flex justify-between mb-2">
            <div className= "text-primary">
              TOTAL LIQUIDITY:
            </div> 
            <div className="font-bold">
              ${currencyFormat(21456789.123456, {decimalsToShow: 0})}
            </div>
          </div>

          <button disabled={false} className="flex flex-row justify-self-center items-center gap-2 border-2 border-secondary inner-glow-secondary px-4 py-2 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            VIEW CONTRACT
          </button>

        </div>

}
export default FarmCard 