// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import CardContent from '@material-ui/core/CardContent'
import Container from '@material-ui/core/Container'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// Bitcrush Components
import PageContainer from 'components/PageContainer'
import Card from 'components/basics/Card'
import PoolCard from 'components/pools/PoolCard'
// Icons
import InvaderIcon, { invaderGradient } from 'components/svg/InvaderIcon'
// utils
import { currencyFormat } from 'utils/text/text'

export default function Home() {

  const [ gradient, gradientId ] = invaderGradient()
  const css = useStyles({ gradientId })
  const totalValueLocked = 9526774.00154119
  const maxWin = totalValueLocked * 0.01
  const totalValueShared = 65010004.115487

  return (
    <div>
      <PageContainer >
          <Typography variant="h2" align="center" component="h1" style={{ marginBottom: 16 , paddingTop: 32, fontWeight: 500 }}>
            <Typography variant="h5" component="p" style={{ fontWeight: 200}}>
              THE FIRST
            </Typography>
            HYBRID CASINO
            <Typography variant="h5" component="p" style={{ fontWeight: 200}}>
              ON BSC
            </Typography>
          </Typography>
          <Grid container justify="center">
              <Grid item className={css.gradientContainer}>
                {gradient}
                <InvaderIcon style={{fontSize: 120}} className={ css.gradient }/>
              </Grid>
          </Grid>
          {/* BITCRUSH TVL INFO */}
          <Container maxWidth="lg">
            <Card style={{ width: '100%'}} background="transparent" shadow="primary" opacity={0.7}>
              <CardContent style={{paddingBottom: 16}}>
                <Grid container justify="space-around">
                  <Grid item>
                    <Typography variant="caption" component="div" align="left" color="primary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Total Value Locked
                    </Typography>
                    <Typography variant="h4" component="div" align="left">
                      {currencyFormat(totalValueLocked,{ decimalsToShow: 0})}
                    </Typography>
                  </Grid>
                  <Divider orientation="vertical" flexItem/>
                  <Grid item>
                    <Typography variant="caption" component="div" align="center" color="secondary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Max Win
                    </Typography>
                    <Typography variant="h4" component="div" align="center">
                      {currencyFormat(maxWin,{ decimalsToShow: 0})}
                    </Typography>
                  </Grid>
                  <Divider orientation="vertical" flexItem/>
                  <Grid item>
                    <Typography variant="caption" component="div" align="right" color="primary" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
                      Total Value Shared
                    </Typography>
                    <Typography variant="h4" component="div" align="right">
                      {currencyFormat(totalValueShared,{ decimalsToShow: 0})}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Grid container justify="center" spacing={3} style={{marginTop: 32}}>
              <Grid item xs={12} md={6}>
                <PoolCard title="Staking Pool" color="primary"
                  stakedInfo={{
                    title: "CRUSH to Harvest",
                    amount: 547.2140070078,
                    subtitle: "-$ 0.00",
                    currency: "$",
                  }}
                  rewardInfo={{
                    title: "CRUSH in Wallet",
                    amount: 547.2140070078,
                    subtitle: "-$ 0.00",
                    currency: "$",
                  }}
                  action1Title="Harvest All"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container justify="flex-end">
                  <PoolCard title="Live Wallet" color="secondary"
                    stakedInfo={{
                      title: "LIVE Wallet Balance",
                      amount: 547.2140070078,
                      subtitle: "-$ 0.00",
                      currency: "CRUSH",
                    }}
                    rewardInfo={{
                      title: "HOUSE Profit Earned",
                      amount: 547.2140070078,
                      subtitle: "-$ 0.00",
                      currency: "CRUSH",
                    }}
                    action1Title="Collect Winnings"
                    action2Title="On Sale Soon"
                    action2Color="primary"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Container>
      </PageContainer>
    </div>
  )
}

const useStyles = makeStyles<Theme, { gradientId: string }>( theme => createStyles({
  gradient: {
    fill: props => `url(#${ props.gradientId })`,
    stroke: theme.palette.common.white,
    strokeWidth: 0.3,
  },
  gradientContainer:{
    background: `radial-gradient(${theme.palette.common.black} 0%, transparent 80%)`
  }
}))