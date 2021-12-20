// Next
import Head from 'next/head'
// Material
import Typography from '@mui/material/Typography'
// Bitcrush
import PageContainer from 'components/PageContainer'
import SummaryCard from 'components/lottery/SummaryCard'
import LotteryHistory from 'components/lottery/LotteryHistory'

const Trade = () => {
  return <PageContainer>
     <Head>
      <title>BITCRUSH - Lottery (comingSoon)</title>
      <meta name="description" content="Lottery Coming Soon"/>
    </Head>
    <SummaryCard/>
    <LotteryHistory/>
  </PageContainer>
}

export default Trade