// Next
import Head from 'next/head'
// Material
import Grid from '@mui/material/Grid'
// Bitcrush
import LotteryHistory from 'components/lottery/LotteryHistory'
import PageContainer from 'components/PageContainer'
import SummaryCard from 'components/lottery/SummaryCard'

const Trade = () => {
  return <PageContainer>
     <Head>
      <title>BITCRUSH - Lottery (comingSoon)</title>
      <meta name="description" content="Lottery Coming Soon"/>
    </Head>
    <SummaryCard/>
    <Grid container>
      <Grid item xs={10} md={6}>
        <LotteryHistory/>
      </Grid>
    </Grid>
  </PageContainer>
}

export default Trade