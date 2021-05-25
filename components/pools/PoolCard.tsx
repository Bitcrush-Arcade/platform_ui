// Material
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// Bitcrush
import Button from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
// utils
import { currencyFormat } from 'utils/text/text'

const PoolCard = (props: PoolCardProps) => {

  const { color, stakedInfo, rewardInfo, action1Title, action2Title, firstAction, secondAction, action2Color } = props

  const action1Width = action2Title ? 200 : '100%'
  const action1Grid = action2Title ? 'auto' : 12
  return <Card background="light" style={{ minWidth: 300, maxWidth: '100%' }}>
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
          {props.icon || 'ICON'}
        </Grid>
      </Grid>
      <Divider orientation="horizontal" style={{marginBottom: 8, marginTop: 8}}/>
      <InfoMoney color={stakedInfo?.color || color}
        {...stakedInfo}
      />
    </CardContent>
    <CardActions style={{ padding: 24 }}>
      <Grid container justify="space-between">
        <Grid item xs={action1Grid}>
          <Button color={color} width={action1Width} onClick={firstAction}>
            {action1Title}
          </Button>
        </Grid>
        {action2Title && <Grid item >
          <Button color={action2Color || color} width={200} onClick={secondAction}>
            {action2Title}
          </Button>
        </Grid>}
      </Grid>
    </CardActions>
  </Card>
}

export default PoolCard

type PoolCardProps ={
  title: string,
  icon?: JSX.Element,
  action1Title: string,
  action2Title?: string,
  firstAction?: () => void,
  secondAction?: () => void,
  color?: 'primary' | 'secondary',
  action2Color?: 'primary' | 'secondary',
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