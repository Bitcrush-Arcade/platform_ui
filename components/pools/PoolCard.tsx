// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
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
  const css = useStyles({})
  const action1Width = action2Title ? 200 : '100%'
  const action1Grid = action2Title ? 'auto' : 12
  return <Card background="light" className={ css.main } >
    <CardContent className={ css.content } >
      <Grid container justify="space-between" direction="row-reverse" >
        <Grid item>
          {props.icon || 'ICON'}
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2" className={css.title} >
            {props.title}
          </Typography>
          <InfoMoney color={rewardInfo?.color || color}
            {...rewardInfo}
          />
        </Grid>
      </Grid>
      <Divider orientation="horizontal" style={{marginBottom: 8, marginTop: 8}}/>
      <InfoMoney color={stakedInfo?.color || color}
        {...stakedInfo}
      />
    </CardContent>
    <CardActions className={ css.actions } >
      <Grid container spacing={1} justify="space-between">
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
  const css = useMoneyStyles({})
  return <>
    <Typography variant="body2" color="textSecondary" className={ css.general }>
      {title}
    </Typography>
    <Typography color={color || 'primary'} display="inline" className={ css.currency }>
      {currency}
      <Typography className={ css.value } display="inline">
        {currencyFormat(amount, { decimalsToShow: 4})}
      </Typography>
    </Typography>
    <Typography variant="body2" color="textSecondary" display="block" className={ css.general }>
      {subtitle}
    </Typography>
  </>
}

const useStyles = makeStyles( (theme: Theme) => createStyles({
  actions:{
    padding: theme.spacing(4),
    paddingTop: 0,
  },
  content:{
    padding: theme.spacing(4),
  },
  main:{
    minWidth: 250,
    width: '100%',
    maxWidth: 560,
  },
  title:{
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]:{
      marginBottom: theme.spacing(2),
      fontSize: theme.typography.h5.fontSize
    }
  }
}))
const useMoneyStyles = makeStyles( (theme: Theme) => createStyles({
  currency:{
    fontWeight: 500,
    fontSize: theme.typography.h5.fontSize,
  },
  value:{
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 500,
    paddingLeft: theme.spacing(1)
  },
  general:{
    opacity: 0.75,
  },
}))