// Next
import Head from 'next/head'
// Material
import Typography from '@mui/material/Typography'
// Bitcrush
import PageContainer from 'components/PageContainer'

const Maintenance = () => {
  return <PageContainer>
    <Head>
      <title>BITCRUSH - UNDER MAINTENANCE</title>
      <meta name="description" content="Trading Coming Soon"/>
    </Head>
    <Typography variant="h1" align="center">
      Under Maintenance, we apologize for any inconveniences.
    </Typography>
  </PageContainer>
}

export default Maintenance