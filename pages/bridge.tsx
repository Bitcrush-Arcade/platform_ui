// Next
import Head from 'next/head';
import { GetStaticProps, InferGetStaticPropsType  } from 'next'
// Bitcrush
import BridgeCard from 'tw/bridge/BridgeCard';
import PageContainer from 'components/PageContainer';
// utils
import { getClient } from 'utils/sanityConfig';
// Query
import { bridgeChains } from 'queries/bridge'

const Bridge = (props: InferGetStaticPropsType<typeof getStaticProps>) => {

  const { bridgeChains } = props;

  return <PageContainer>
    <Head>
      <title>BITCRUSH - Cross Chain BRIDGE</title>
      <meta name="description" content="Cross Chain Bridge"/>
    </Head>
    <h2 className="text-center text-4xl whitespace-pre-line font-zeb">
        Intergalactic Bridge
    </h2>
    <div className="flex flex-row justify-center mt-9">
      <BridgeCard bridgeChains={bridgeChains}/>
    </div>

  </PageContainer>
}

export default Bridge

export const getStaticProps: GetStaticProps = async() => {
  const client = getClient()
  const validChains = await client.fetch(bridgeChains)
  return{
    props:{
      bridgeChains: validChains
    }
  }
}