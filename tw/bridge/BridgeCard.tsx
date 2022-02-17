//Components
import Card from 'components/basics/Card';
// Material
import TextField from '@mui/material/TextField';
// Prop Definition

const BridgeCard = () => {

  return <div className="flex flex-col gap-6 border-2 border-secondary inner-glow-secondary bg-paper-bg px-4 py-6 rounded-[32px] max-w-[500px]">
          
          
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

          <div className="flex flex-col items-center gap-2">
            <button className="border-2 border-secondary inner-glow-secondary px-3 py-1 text-xs rounded-full hover:bg-secondary hover:text-black">
            BRIDGE TOKENS
            </button>
            <button className="border-2 border-primary inner-glow-primary px-3 py-1 text-xs rounded-full hover:bg-primary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
            CONNECT TO WALLET
            </button>
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
