// Next
import Head from 'next/head';
import PageContainer from 'components/PageContainer';
import FarmCard from 'tw/farms/FarmCard';


const Farm = () => {

  return <PageContainer>
    <Head>
      <title>BITCRUSH - Farms</title>
      <meta name="description" content="BITCRUSH Farms"/>
    </Head>
    <h2 className="text-center text-6xl whitespace-pre-line font-zeb">
        Warp Farms
    </h2>
    <FarmCard/>
  </PageContainer>
}

export default Farm

