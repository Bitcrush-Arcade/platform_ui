// Next
import Head from 'next/head';
// Bitcrush
import BridgeCard from 'tw/bridge/BridgeCard';
import PageContainer from 'components/PageContainer';

const Bridge = () => {


  return <PageContainer>
    <Head>
      <title>BITCRUSH - Cross Chain BRIDGE</title>
      <meta name="description" content="Cross Chain Bridge"/>
    </Head>
    <h2 className="text-center text-4xl whitespace-pre-line font-zeb">
        Intergalactic Bridge
    </h2>
    <div className="flex flex-row justify-center mt-9">
      <BridgeCard/>
    </div>

  </PageContainer>
}

export default Bridge