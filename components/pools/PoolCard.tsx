// Material
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// Bitcrush
import Card from 'components/basics/Card'
// utils
import { currencyFormat } from 'utils/text/text'

const PoolCard = (props: PoolCardProps) => {

  const { color, stakedInfo, rewardInfo } = props

  return <Card background="light" shadow={color} style={{ minWidth: 300, maxWidth: '100%' }}>
    <CardContent style={{ padding: 32 }}>
      <Grid container justify="space-between" >
        <Grid item xs={7}>
          <Typography>
            {props.title}
          </Typography>
          <InfoMoney color={rewardInfo?.color || color}
            {...rewardInfo}
          />
        </Grid>
        <Grid item>
          ICON
        </Grid>
      </Grid>
      <Divider orientation="horizontal" style={{marginBottom: 8, marginTop: 8}}/>
      <InfoMoney color={stakedInfo?.color || color}
        {...stakedInfo}
      />
    </CardContent>
  </Card>
}

export default PoolCard

type PoolCardProps ={
  title: string,
  icon?: string,
  invested?: number,
  reward?: number,
  firstAction?: () => void,
  secondAction?: () => void,
  color?: 'primary' | 'secondary',
  stakedInfo: InfoStakeProps,
  rewardInfo: InfoStakeProps,
}

type InfoStakeProps = {
  title: string,
  amount: number,
  currency:string,
  subtitle: string,
  color?: 'primary' | 'secondary'
}

const InfoMoney = ( props: InfoStakeProps ) => {
  const { title, subtitle, currency, amount, color } = props
  return <Typography variant="caption" color="textSecondary" style={{ fontSize: 10}}>
    {title}
    <Typography color={color || 'primary'}>
      {currency}&nbsp;{currencyFormat(amount, { decimalsToShow: 4})}
    </Typography>
    {subtitle}
  </Typography>
}