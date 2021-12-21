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
      <title>BITCRUSH - Lottery</title>
      <meta name="description" content="The lottery where everyone wins."/>
    </Head>
    <SummaryCard/>
    <Grid container sx={{mt: 4}}>
      <Grid item xs={12} md={6}>
        <LotteryHistory/>
      </Grid>
    </Grid>
  </PageContainer>
}

export default Trade