//Components
import Card from 'components/basics/Card';

// Next
import Head from 'next/head';
// Bitcrush
import PageContainer from 'components/PageContainer';
import BridgeCard from 'tw/bridge/BridgeCard';

const Bridge = () => {
  return <PageContainer>
    <Head>
      <title>BITCRUSH - Cross Chain BRIDGE</title>
      <meta name="description" content="Cross Chain Bridge"/>
    </Head>
    <h2 className="text-center text-4xl whitespace-pre-line font-zeb">
        Intergalactic Bridge
    </h2>
    <div className="flex flex-row justify-center mt-6">
      <BridgeCard/>
    </div>

  </PageContainer>
}

export default Bridge