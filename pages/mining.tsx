import { useMemo } from 'react'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// Bitcrush
import CompoundingCard from "components/pools/CompoundingCard"
import PageContainer from 'components/PageContainer'
import PoolCard from 'components/pools/PoolCard'
// libs
import { getContracts } from "data/contracts"
import { useWeb3React } from "@web3-react/core"
import { useContract } from "hooks/web3Hooks"

const Mining = () => {

  const css = useStyles({})
  const { chainId } = useWeb3React()

  const firstPool = useMemo( () => getContracts('singleAsset', chainId ), [chainId])
  const token = useMemo( () => getContracts('crushToken', chainId ), [chainId])

  return <PageContainer background="galactic">
    <Grid container justify="space-evenly">
    <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="Mining Pool"
          description={`Stake CRUSH coins to earn APY as well as part of the House Edge.
            Staking not only helps stabilize the CRUSH Economy, it also provides Bankroll for the games.
            Due to the nature of gambling, this is riskier, but result in higher rewards than traditional staking.`}
        />
      </Grid>
      <Grid item>
        <CompoundingCard/>
      </Grid>
    </Grid>
    <Grid container justify="center" spacing={1} className={ css.section }>
      <Grid item>
        <PoolCard abi={firstPool.abi} contractAddress={firstPool.address} tokenAbi={token.abi} tokenAddress={token.address}/>
      </Grid>
    </Grid>
    <Grid container justify="space-evenly" className={ css.section }>
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="Galactic Mining"
          description={`Stake CRUSH coins to earn APY as well as part of the House Edge.
            Staking not only helps stabilize the CRUSH Economy, it also provides Bankroll for the games.
            Due to the nature of gambling, this is riskier, but result in higher rewards than traditional staking.`}
        />
      </Grid>
      <Grid item style={{ width: 280}} />
    </Grid>
  </PageContainer>
}

export default Mining

const useStyles = makeStyles<Theme, {}>( (theme) => createStyles({
  
  section:{
    marginTop: theme.spacing(4)
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