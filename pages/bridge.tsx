//Components
import Card from 'components/basics/Card';

// Next
import Head from 'next/head'
// Material
import TextField from '@mui/material/TextField';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
// Bitcrush
import PageContainer from 'components/PageContainer'
import GButton from 'components/basics/GeneralUseButton'

const Trade = () => {
  return <PageContainer>
    <Head>
      <title>BITCRUSH - BRIDGE</title>
      <meta name="description" content="Cross Chain Bridge"/>
    </Head>
    <h2 className="text-center text-4xl tracking-widest">
      Welcome  
    </h2>
    <h2 className="text-center text-xl tracking-widest">
      to the 
    </h2>
    <h2 className="text-center font-bold text-4xl font-zeb tracking-widest">
      Intergalactic Bridge
    </h2>

    {/* Main chain CARD CONTAINER */}
    <div className="flex justify-between items-center flex-grow border-2 border-primary rounded-[32px] p-10 bg-paper-bg inner-glow-primary max-w-[900px] text-white mt-7">
          <div>
            <TextField
            required
            id="outlined-required"
            label="From"
            defaultValue="0.0"
            inputProps={{style: {fontSize: 25}}}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 ">
            <button 
              className="border-2 border-secondary px-4 py-2 inner-glow-secondary text-xs rounded-full hover:bg-secondary hover:text-black max-w-[8em] disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
            >
            <div className="flex flex-row">
              TOKEN  
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
            </div>  
            </button>

            <button 
              className="border-2 border-secondary px-4 py-2 inner-glow-secondary text-xs rounded-full hover:bg-secondary hover:text-black max-w-[8em] disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              <div className="flex flex-row">
                CHAIN
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
    </div>

    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>

    {/* Side chain CARD CONTAINER */}

  </PageContainer>
}

export default Trade