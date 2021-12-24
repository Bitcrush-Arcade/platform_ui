// Next
import Head from 'next/head'
// Material
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// Bitcrush
import PageContainer from 'components/PageContainer'

const Nft = () => {
  return <PageContainer>
    <Head>
      <title>BITCRUSH - Invaderverse</title>
      <meta name="description" content="Ready for the coming invasion? Invaders incoming. N.I.C.E. Invaders and Invaderverse coming soon..."/>
    </Head>
    <Stack mt={2}>
      <Typography align="center" variant="h4" display="inline" fontFamily="Zebulon" pb={5}>
        N.I.C.E. Invaders
      </Typography>
      <Typography align="center" variant="h3" display="inline">
      &nbsp;and&nbsp;
      </Typography>
      <Typography align="center" display="inline" fontFamily="MarsAttacks" component="span" 
        sx={{
          fontSize:{
            xs: "90px",
            md: "100px",
            lg: "150px",
          }
        }}
      >
        the&nbsp;Invaderverse
      </Typography>
      <Typography align="center" variant="h3" display="inline">
        &nbsp;coming soon.
      </Typography>
    </Stack>
  </PageContainer>
}

export default Nft