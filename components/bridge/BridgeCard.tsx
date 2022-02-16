//Components
import Card from 'components/basics/Card';

// Next
import Head from 'next/head'
// Material
import TextField from '@mui/material/TextField';

{/* BridgeCard props */}
type BridgeCardProps = {

  textFieldLabel: "from" | "to";
  borderColor?: "primary" | "secondary";
  buttonColor?: "primary" | "secondary";

}

const BridgeCard = (props: BridgeCardProps) => {
  const { textFieldLabel, borderColor, buttonColor} = props

  return <div className="grid rows-3 gap-4 justify-items-center content-center">

      {/* Main chain CARD CONTAINER */}
      <div className="grid grid-rows-1 grid-cols-2 gap-2 justify-items-center items-center border-2 border-primary rounded-[32px] p-10 bg-paper-bg inner-glow-primary max-w-[900px]">
        
        <TextField
        required
        id="outlined-required"
        label = {textFieldLabel}
        defaultValue="0.0"
        inputProps={{style: {fontSize: 25}}}
        />

        {/* Button column */}   
        <div className="grid grid-cols-2 place-content-between gap-4">
          <button 
            className="grid place-content-between items-center grid-cols-2 grid-rows-1 gap-10 border-2 border-primary px-4 py-2 inner-glow-primary text-xs rounded-full hover:bg-primary hover:text-black max-w-[15em] disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            <div>
              TOKEN
            </div>
            {/* Circle arrow down icon */}  
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" 
              clipRule="evenodd" 
              />
            </svg>
          </button>

          <button 
            className="grid place-content-between items-center grid-cols-2 grid-rows-1 gap-10 border-2 border-primary px-4 py-2 inner-glow-primary text-xs rounded-full hover:bg-primary hover:text-black max-w-[15em] disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            <div>
              CHAIN
            </div>  
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" 
              clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
      </div>

  </div>
}
export default BridgeCard
