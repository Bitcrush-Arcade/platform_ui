// Next
import Head from 'next/head';
import PageContainer from 'components/PageContainer';
import FarmCard from 'tw/farms/FarmCard';

async function getStaticProps() {




  return { props: {} }
}


const Farms = () => {


  return <PageContainer>
    <Head>
      <title>BITCRUSH - Farms</title>
      <meta name="description" content="BITCRUSH Farms" />
    </Head>
    <h2 className="text-center text-4xl mt-4 whitespace-pre-line font-zeb md:text-6xl lg:mt-0">
      Stellar Farms
    </h2>
    <div className="flex justify-center mt-9">
      <div className="flex flex-wrap gap-x-6 gap-y-8 justify-center lg:justify-evenly max-w-[61rem]">
        <FarmCard
          color="primary"
          highlight={true}
          poolAssets=
          {{
            baseTokenName: "BASE",
            baseTokenSymbol: "BT",
            baseTokenImage: "base token url",

            mainTokenName: "MAIN",
            mainTokenSymbol: "MT",
            mainTokenImage: "main token url",

            swapName: "SWAPNAME",
            swapLogo: "ape swap url",

            pid: 1
          }}
        />

      </div>
    </div>
  </PageContainer>
}

export default Farms

