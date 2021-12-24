import { useState } from 'react'
// Next
import Head from 'next/head'
// Material
import Grid from '@mui/material/Grid'
// Bitcrush
import LotteryHistory from 'components/lottery/LotteryHistory'
import PageContainer from 'components/PageContainer'
import SummaryCard from 'components/lottery/SummaryCard'
import TicketBuyModal from 'components/lottery/TicketBuyModal'

const Trade = () => {

  const [ openBuy, setOpenBuy ] = useState<boolean>(true)
  const toggleOpenBuy = () => setOpenBuy( p => !p )

  return <PageContainer>
     <Head>
      <title>BITCRUSH - Lottery</title>
      <meta name="description" content="The lottery where everyone wins."/>
    </Head>
    <SummaryCard onBuy={toggleOpenBuy} />
    <Grid container sx={{mt: 4}} justifyContent="space-between">
      <Grid item xs={12} md={6}>
        <LotteryHistory/>
      </Grid>
      <Grid item>
        Check winning
      </Grid>
    </Grid>
    <TicketBuyModal
      open={openBuy}
      onClose={toggleOpenBuy}
    />
  </PageContainer>
}

export default Trade