//Components
import Card from 'components/basics/Card';

// Next
import Head from 'next/head'
// Material
import TextField from '@mui/material/TextField';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
// Bitcrush
import PageContainer from 'components/PageContainer'
import BridgeCard from 'components/bridge/BridgeCard';

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
    <br></br>

    <div className="grid rows-3 gap-4 justify-items-center content-center">

      <BridgeCard fromTo="from" borderColor="primary" buttonColor="secondary"/>

      {/* Arrow down icon */}  
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>

      {/* Side chain CARD CONTAINER */}
      <BridgeCard fromTo="to" borderColor="secondary" buttonColor="primary"/>

    </div>

  </PageContainer>
}

export default Trade