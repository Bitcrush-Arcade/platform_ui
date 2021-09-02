import { useMemo } from 'react'
// Next
import Head from 'next/head'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// Bitcrush
import CompoundingCardv2 from 'components/pools/CompoundingCardv2'
import CompoundingCard from "components/pools/CompoundingCard"
import PageContainer from 'components/PageContainer'
import PoolCard from 'components/pools/PoolCard'
import BankPool from 'components/pools/BankPool'
// libs
import { getContracts } from "data/contracts"
import { useWeb3React } from "@web3-react/core"

const Mining = () => {

  const css = useStyles({})
  const { chainId } = useWeb3React()

  const firstPool = useMemo( () => getContracts('singleAsset', chainId ), [chainId])
  const token = useMemo( () => getContracts('crushToken', chainId ), [chainId])

  return <PageContainer background="galactic">
    <Head>
      <title>BITCRUSH - MINING</title>
      <meta name="description" content="Mine CRUSH to your heart's content. Keep a look for more Pools to stake on soon"/>
    </Head>
    <Grid container justifyContent="space-evenly" className={ css.topSection }>
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="Galactic Mining"
          description={`Stake CRUSH coins to earn APY as well as part of the House Edge.
            Staking not only helps stabilize the CRUSH Economy, it also provides Bankroll for the games.
            Due to the nature of gambling, this is riskier, but result in higher rewards than traditional staking.`}
        />
      </Grid>
      <Grid item>
        <CompoundingCardv2/>
      </Grid>
      <Grid item xs={12}>
        <BankPool/>
      </Grid>
    </Grid>
    <Grid container justifyContent="space-evenly" className={ css.section }>
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="Mining Pool"
          description={`Stake CRUSH coins in our single asset staking pool to earn APY that is Auto Compounded.
            You can help the community by calling the auto Compound function and earning a bounty % of the entire pending reward amount. 
            All you need to do it press the Claim button,  and watch the rewards compound for everyone staked in the pool.`}
        />
      </Grid>
      <Grid item>
        <CompoundingCard/>
      </Grid>
    </Grid>
    <Grid container justifyContent="center" spacing={1} className={ css.section }>
      <Grid item>
        <PoolCard abi={firstPool.abi} contractAddress={firstPool.address} tokenAbi={token.abi} tokenAddress={token.address}/>
      </Grid>
    </Grid>
  </PageContainer>
}

export default Mining

const useStyles = makeStyles<Theme, {}>( (theme) => createStyles({
  
  section:{
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },
  topSection:{
    marginTop: 0,
    [theme.breakpoints.down('sm')]:{
      marginTop: theme.spacing(4)
    },
  },
  
}))

const useDescriptorStyles = makeStyles<Theme, {}>( (theme) => createStyles({
  textContainer:{
    borderLeftColor: theme.palette.primary.main,
    borderLeftStyle: 'solid',
    borderLeftWidth: theme.spacing(0.5) ,
    paddingLeft: theme.spacing(3)
  },
  paragraph:{
    whiteSpace: 'pre-line',
    lineHeight: '150%'
  },
}))

const Descriptor = (props: { title: string, description: string }) => {
  const css = useDescriptorStyles({})
  return <div className={ css.textContainer }>
    <Typography variant="h4" component="h1" paragraph>
      {props.title}
    </Typography>
    <Typography variant="body2" className={ css.paragraph }>
      {props.description}
    </Typography>
</div>
}