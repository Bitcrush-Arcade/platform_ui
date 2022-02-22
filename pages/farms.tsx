// Next
import Head from 'next/head';
import { GetStaticProps, InferGetStaticPropsType  } from 'next'
// Bitcrush

import PageContainer from 'components/PageContainer';
// utils
import { getClient } from 'utils/sanityConfig';


const Farm = () => {

  return <PageContainer>
    <Head>
      <title>BITCRUSH - Farms</title>
      <meta name="description" content="BITCRUSH Farms"/>
    </Head>
    <h2 className="text-center text-6xl whitespace-pre-line font-zeb">
        Warp Farms
    </h2>
    
  </PageContainer>
}

export default Farm

