// Next
import Head from 'next/head'
// Material
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Card from 'components/basics/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography'

// Bitcrush
import PageContainer from 'components/PageContainer'

const Trade = () => {
  return <PageContainer>
    <Head>
      <title>BITCRUSH - BRIDGE</title>
      <meta name="description" content="Cross Chain Bridge"/>
    </Head>
    <Typography variant="h2" align="center">
      <text>
        Welcome to the  
      </text>
    </Typography>

    <h2 className="text-center font-bold text-xl font-zeb tracking-widest">
    Intergalactic Bridge
    </h2>
    
    <Card background="light" shadow="secondary" sx={{p: 3}}>
      <TextField
            required
            id="outlined-required"
            label="From:"
            defaultValue="0.0"
            type="number"
          />
          
    </Card>
    
    <ArrowDownwardIcon color="primary" sx={{fontSize: 40, bottom: 0, position: 'relative', mx: 0.5}} />

    <Card background="light" shadow="secondary" sx={{p: 3}}>
      <TextField
            required
            id="outlined-required"
            label="To:"
            defaultValue="0.0"
            type="number"
          />
    </Card>
    
  </PageContainer>
}

export default Trade