type FarmCardProps = {
  themeColor: string
}

const FarmCard = () => {

  return <div className="grid grid-col justify-items-stretch gap-2 p-10 border-2 border-primary inner-glow-primary bg-paper-bg rounded-[32px] max-w-[400px] text-white">
          
          <div className="flex justify-between items-center">
            <div>
              COIN ARTS
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[1.5rem] font-bold">
                NICE-BNB
              </div>
              <div className="flex flex-row gap-1">
                <div className="border border-2 rounded-full px-2 py-1 text-sm">
                  NO FEES 
                </div>
                <div className="border border-2 rounded-full px-2 py-1 text-sm">
                  40X
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-between">
            <div>
              APR:
            </div> 
            <div className="font-bold">
              APR VALUE % + ROITABLEICON
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              EARN:
            </div>
            <div className="font-bold"> 
              EARN VALUE (TEXT)
            </div>
          </div>

          {/* <div className="flex justify-between">
            <div>
              TOKEN PRICE:
            </div>
            <div> 
              TOKEN PRICE VALUE
            </div>
          </div> */}

          <div className="flex justify-between">
            <div>
              DEPOSIT FEE:
            </div>
            <div className="font-bold"> 
              DEPOSIT FEE %
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div>
                NICE EARNED TEXT
              </div>
              <div>
                NICE EARNED VALUE
              </div>
            </div>
            <button disabled={false} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-4 py-2 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
              HARVEST
            </button>
          </div>

          <div>
            <div>
              NICE-BNB LP STAKED TEXT
            </div>
            <div>
              NICE-BNB LP VALUE
            </div>
          </div>

          
          <button disabled={false} className="flex flex-row justify-self-center items-center gap-2 border-2 border-secondary inner-glow-secondary px-6 py-4 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            ENABLE CONTRACT
          </button>

          <div className="justify-self-center">
            HIDE V
          </div>

          <div className="flex justify-between">
            <div>
              DEPOSIT:
            </div> 
            <div className="font-bold">
              NICE-BNB LP + LINKBUTTON
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              TOTAL LIQUIDITY:
            </div> 
            <div className="font-bold">
              TOTAL LIQUIDITY VALUE
            </div>
          </div>

          <div className="justify-self-center">
            VIEW CONTRACT
          </div>

        </div>

}
export default FarmCard 