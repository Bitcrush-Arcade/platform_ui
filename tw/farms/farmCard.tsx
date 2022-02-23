type FarmCardProps = {
  themeColor: string
}

const FarmCard = () => {

  return <div className="grid grid-col justify-items-stretch items-center gap-2 p-10 border-2 border-primary inner-glow-primary bg-paper-bg rounded-[32px] max-w-[400px] text-white">
          
          <div className="flex justify-between items-center">
            <div>
              COIN ARTS
            </div>
            <div className="flex flex-col items-end">
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
                <button disabled={false} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-4 py-2 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
                  HARVEST
                </button>
              </div>
            </div>

          <div>
            <div className="form-label inline-block text-primary text-xs pl-2 font-bold">
              NICE-BNB LP STAKED
            </div>
            <input
              type="text"
              className="
                px-3 py-1.5
                bg-paper-bg
                border-2 border-secondary 
                rounded-[8px]
                text-slate-500
              "
              id="amountEarned"
              value="0.0"
              aria-label="readonly amount earned"
              readOnly
            />
          </div>

          
          <button disabled={false} className="flex flex-row justify-self-center items-center gap-2 border-2 border-secondary inner-glow-secondary px-6 py-4 my-4 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            ENABLE CONTRACT
          </button>

          <hr className="border-slate-500"/>

          <div className="flex gap-1 justify-self-center text-secondary text-xs">
            HIDE 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex justify-between mt-2">
            <div className="text-primary">
              DEPOSIT:
            </div> 
            <div className="flex gap-1 items-center font-bold">
              NICE-BNB LP
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>

          <div className="flex justify-between">
            <div className= "text-primary">
              TOTAL LIQUIDITY:
            </div> 
            <div className="font-bold">
              $21,480,596
            </div>
          </div>

          <button disabled={false} className="flex flex-row justify-self-center items-center gap-2 border-2 border-secondary inner-glow-secondary px-4 py-2 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            VIEW CONTRACT
          </button>

        </div>

}
export default FarmCard 