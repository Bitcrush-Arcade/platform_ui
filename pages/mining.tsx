// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import CardContent from "@material-ui/core/CardContent"
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// Bitcrush
import Button from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import PageContainer from 'components/PageContainer'
import PoolCard from 'components/pools/PoolCard'
// libs
import { currencyFormat } from "utils/text/text"
import { getContracts } from "data/contracts"
import { useWeb3React } from "@web3-react/core"

const Mining = () => {

  const css = useStyles({})
  const { chainId } = useWeb3React()

  const distributionAmount = 0

  const firstPool = getContracts('masterChef', chainId )

  return <PageContainer background="galactic">
    <Grid container justify="space-evenly">
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="Galactic Mining"
          description={`Stake CRUSH coins to earn APY as well as part of the House Edge.
            Staking not only helps stabilize the CRUSH Economy, it also provides Bankroll for the games.
            Due to the nature of gambling, this is riskier, but result in higher rewards than traditional staking.`}
        />
      </Grid>
      <Grid item>
        <Card background="light" shadow="dark" className={ css.claimCard } >
          <CardContent className={ css.cardContent }>
            <Typography className={ css.cardTitle } paragraph>
              House Profit Distribution
            </Typography>
            <Grid container justify="space-between" alignItems="flex-end">
              <Grid item>
                <Typography color="primary" variant="h5" component="p">
                  {currencyFormat(distributionAmount, { decimalsToShow: 4 })}
                </Typography>
                <Typography color="textSecondary" variant="caption" component="p">
                  $&nbsp;{currencyFormat(distributionAmount, { decimalsToShow: 2 })}
                </Typography>
              </Grid>
              <Grid item>
                <Button size="small" width={80} color="primary">
                  Claim
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    <Grid container justify="space-evenly" className={ css.section }>
      <Grid item xs={10} sm={8} md={6}>
        <Descriptor
          title="Mining Pool"
          description={`Stake CRUSH coins to earn APY as well as part of the House Edge.
            Staking not only helps stabilize the CRUSH Economy, it also provides Bankroll for the games.
            Due to the nature of gambling, this is riskier, but result in higher rewards than traditional staking.`}
        />
      </Grid>
      <Grid item style={{ width: 280}} />
    </Grid>
    <Grid container justify="center" spacing={1} className={ css.section }>
      <Grid item>
        <PoolCard abi={firstPool.abi} contractAddress={firstPool.address}/>
      </Grid>
    </Grid>
  </PageContainer>
}

export default Mining

const useStyles = makeStyles<Theme, {}>( (theme) => createStyles({
  cardTitle:{
    fontWeight: 'bold'
  },
  cardContent:{
    padding: theme.spacing(3)
  },
  section:{
    marginTop: theme.spacing(4)
  },
  claimCard:{
    [theme.breakpoints.down('sm')]:{
      marginTop: theme.spacing(4)
    },
    width: 280,
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