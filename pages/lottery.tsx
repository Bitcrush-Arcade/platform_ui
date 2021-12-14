// Next
import Head from 'next/head'
// Material
import Typography from '@mui/material/Typography'
// Bitcrush
import PageContainer from 'components/PageContainer'
import SummaryCard from 'components/lottery/SummaryCard'

const Trade = () => {
  return <PageContainer>
     <Head>
      <title>BITCRUSH - Lottery (comingSoon)</title>
      <meta name="description" content="Lottery Coming Soon"/>
    </Head>
    <SummaryCard/>
  </PageContainer>
}

export default Trade