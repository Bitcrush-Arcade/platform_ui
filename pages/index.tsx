// Material
import Typography from '@material-ui/core/Typography'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
// Bitcrush Components
import PageContainer from 'components/PageContainer'
import Card from 'components/basics/Card'
// utils
import { currencyFormat } from 'utils/text/text'

export default function Home() {

  const totalValueLocked = 9526774.00154119
  const maxWin = totalValueLocked * 0.01
  const totalValueShared = 65010004.115487

  return (
    <div>
      <PageContainer >
          <Typography variant="h3" align="center" component="h1">
            <Typography variant="caption" component="p">
              THE FIRST
            </Typography>
            HYBRID CASINO
            <Typography variant="caption" component="p">
              ON BSC
            </Typography>
          </Typography>
          <Card style={{ width: '100%'}} background="transparent" shadow="primary">
            <CardContent style={{paddingBottom: 16}}>
              <Grid container justify="space-between">
                <Grid item>
                  <Typography variant="caption" component="div" align="left" color="primary" style={{fontSize: 10, opacity: 0.7}}>
                    Total Value Locked
                  </Typography>
                  <Typography variant="h4" component="div" align="left">
                    {currencyFormat(totalValueLocked,{ decimalsToShow: 0})}
                  </Typography>
                </Grid>
                <Divider orientation="vertical" flexItem/>
                <Grid item>
                  <Typography variant="caption" component="div" align="center" color="secondary" style={{fontSize: 10, opacity: 0.7}}>
                    Max Win
                  </Typography>
                  <Typography variant="h4" component="div" align="center">
                    {currencyFormat(maxWin,{ decimalsToShow: 0})}
                  </Typography>
                </Grid>
                <Divider orientation="vertical" flexItem/>
                <Grid item>
                  <Typography variant="caption" component="div" align="right" color="primary" style={{fontSize: 10, opacity: 0.7}}>
                    Total Value Shared
                  </Typography>
                  <Typography variant="h4" component="div" align="right">
                    {currencyFormat(totalValueShared,{ decimalsToShow: 0})}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
      </PageContainer>
    </div>
  )
}
