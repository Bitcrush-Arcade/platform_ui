  // Next
  import Head from 'next/head'
  // Material
  import Box from '@mui/material/Box'
  import Grid from '@mui/material/Grid'
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
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                paddingTop: '56.25%',
              }}
            >
              <iframe 
                style={{
                  position:'absolute',
                  width: "100%",
                  height: "100%",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                }}
                src="https://www.youtube.com/embed/G9_9zI3U10A"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Grid>
        </Grid>
        <Typography align="center" variant="h3" display="inline" sx={{ mt: 3}}>
          &nbsp;coming soon.
        </Typography>
      </Stack>
    </PageContainer>
  }

  export default Nft