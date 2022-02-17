
// Props
type BridgeCardProps = {
  account: string;
  amount: number;
  walletBalance: number;
}

const BridgeCard = (props: BridgeCardProps) => {

  const { account, amount, walletBalance } = props
  
  return <div className="flex flex-col gap-10 border-2 border-secondary inner-glow-secondary bg-paper-bg px-11 py-14 rounded-[32px] max-w-[500px]">
          
          <div className="flex flex-row justify-between">
            <div>
            CHAIN SELECTOR 1
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div>
            CHAIN SELECTOR 2
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div>
            TOKEN SELECTOR ( NICE TOGGLE CRUSH )
            </div>
            <div>
            TEXTFIELD FOR AMOUNT
            </div>
          </div>

          <div className="flex flex-row justify-center">
            {
              account
                ?
              <button disabled={amount>0 && amount<walletBalance} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-6 py-4 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                BRIDGE TOKENS
              </button>
              :
              <button className="flex flex-row items-center gap-2 border-2 border-primary inner-glow-primary px-6 py-4 text-xs rounded-full hover:bg-primary hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                CONNECT TO WALLET
              </button>
            }
          </div>

          <div className="flex border-2 border-primary rounded-[32px] justify-center mx-2">
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
}
const ChainSelector = (props: SelectorProps)=>{}
