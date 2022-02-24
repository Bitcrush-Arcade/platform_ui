// Next
import Head from 'next/head';
import PageContainer from 'components/PageContainer';
import FarmCard from 'tw/farms/FarmCard';


const Farms = () => {

  return <PageContainer>
    <Head>
      <title>BITCRUSH - Farms</title>
      <meta name="description" content="BITCRUSH Farms"/>
    </Head>
    <h2 className="text-center text-6xl whitespace-pre-line font-zeb">
        Warp Farms
    </h2>
    <div className="flex justify-center mt-9">
      <div className="flex flex-wrap gap-x-6 gap-y-8 justify-center lg:justify-evenly max-w-[61rem]">
        <FarmCard/>
        <FarmCard/>
        <FarmCard/>
        <FarmCard/>
      </div>
    </div>
  </PageContainer>
}

export default Farms

