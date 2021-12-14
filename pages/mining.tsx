import { useMemo, useState } from 'react'
// Next
import Head from 'next/head'
// Material
import { Theme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
// Bitcrush
import CompoundingCardv2 from 'components/pools/CompoundingCardv2'
import PageContainer from 'components/PageContainer'
import PoolCard from 'components/pools/PoolCard'
import PoolCardv2 from 'components/pools/PoolCardv2'
import BankPool from 'components/pools/BankPool'
// libs
import { getContracts } from "data/contracts"
import { useWeb3React } from "@web3-react/core"

const Mining = () => {

  const css = useStyles({})
  const { chainId } = useWeb3React()

  const [showInactive, setShowInactive] = useState<boolean>(false)
  const toggleInactive = () => setShowInactive( p => !p )

  const firstPool = useMemo( () => getContracts('singleAsset', chainId ), [chainId])
  const prevPool = useMemo( () => getContracts('prevStaking2', chainId ), [chainId])
  const token = useMemo( () => getContracts('crushToken', chainId ), [chainId])

  return <PageContainer background="galactic">
    <Head>
      <title>BITCRUSH - MINING</title>
      <meta name="description" content="Mine CRUSH to your heart's content. Keep a look for more Pools to stake on soon"/>
    </Head>
    <Grid container justifyContent="space-evenly"
      sx={ theme => ({
        mt: 0,
        [theme.breakpoints.down('md')]:{
          mt: theme.spacing(4)
        }
      })}
    >
      <Grid item xs={10} sm={8} md={6} >
        <Descriptor
          title="Galactic Mining"
          description={`Stake CRUSH to earn APY as well as a share of the House Profit Distribution.
          Staking not only helps stabilize the CRUSH Economy, it also provides Bankroll for the games to scale.
          Due to the nature of gambling, this is riskier, but result in higher rewards than traditional staking. Please read through the information card or ask the community if you have any questions.
          
          You can help the community by calling the auto Compound function and earning a bounty % of the entire pending reward amount.
          All you need to do it press the Claim button, and watch the rewards compound for everyone staked in the pool.`}
        />
      </Grid>
      <Grid item sx={{ pt: { xs: 4, md: 0 }}}>
        <CompoundingCardv2/>
      </Grid>
      <Grid item xs={12} sx={{ pt: 4 }}>
        <BankPool/>
      </Grid>
    </Grid>
    <Grid container justifyContent="space-evenly" className={ css.section }>
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="More Pools"
          description={`Stake CRUSH coins in our single asset staking pool to earn APY.
          No risk pools`}
        />
      </Grid>
      <Grid item style={{width: 215}}/>
    </Grid>
    <Grid container justifyContent="space-evenly" className={ css.section }>
      <Grid item>
        <PoolCard abi={firstPool.abi} contractAddress={firstPool.address} tokenAbi={token.abi} tokenAddress={token.address} infoText="No fees! - Crush It!"/>
      </Grid>
    </Grid>
    <Grid container justifyContent="space-evenly" className={ css.section }>
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="Inactive Pools"
          description={<>
          {`Empty pools, nothing to do except withdraw.\n`}
            Hide <Switch value={showInactive} onClick={toggleInactive}/> Show
          </>}
        />
      </Grid>
      <Grid item style={{width: 215}}/>
    </Grid>
    {
      showInactive &&
      <Grid container justifyContent="center" className={ css.section }>
        <Grid item>
          <PoolCardv2
            abi={prevPool.abi}
            address={prevPool.address}
            name="Expiring SAS Pool"
            subtext="Simple Reward APR Pool"
          />
        </Grid>
      </Grid>
    }
  </PageContainer>
}

export default Mining

const useStyles = makeStyles<Theme, {}>( (theme) => createStyles({
  
  section:{
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
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

const Descriptor = (props: { title: string, description: React.ReactNode }) => {
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