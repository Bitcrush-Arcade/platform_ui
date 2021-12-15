// Material
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import type { FabProps } from '@mui/material/Fab'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
// Bitcrush
import Button from 'components/basics/GeneralUseButton'
import Currency from 'components/basics/Currency'
import Card from 'components/basics/Card'
// utils
import { currencyFormat } from 'utils/text/text'
import BigNumber from 'bignumber.js'

const PoolCard = (props: PoolCardProps) => {

  const { color, stakedInfo, rewardInfo, action1Title, action2Title, firstAction, secondAction, action2Color, btn1Props, btn2Props } = props
  const css = useStyles({})
  const action1Grid = action2Title ? 'auto' : 12
  return <Card background="light" className={ css.main } >
    <CardContent className={ css.content } >
      <Grid container justifyContent="space-between" className={ css.titleGrid }>
        <Grid item>
          <Typography variant="h4" component="h2" className={css.title} >
            {props.title}
          </Typography>
        </Grid>
        <Grid item>
          {props.icon || 'ICON'}
        </Grid>
      </Grid>
      <InfoMoney color={rewardInfo?.color || color}
        {...rewardInfo}
      />
      <Divider orientation="horizontal" style={{marginBottom: 8, marginTop: 8}}/>
      <InfoMoney color={stakedInfo?.color || color}
        {...stakedInfo}
      />
    </CardContent>
    <CardActions className={ css.actions } >
      <Grid container justifyContent="center">
        <Grid item xs={12} style={{ paddingTop: 4, paddingBottom: 4}}>
          <Button color={color} width={"100%"} onClick={firstAction} {...(btn1Props || {})}>
            {action1Title}
          </Button>
        </Grid>
        {action2Title && <Grid item xs={12} style={{ paddingTop: 4, paddingBottom: 4}}>
          <Button color={action2Color || color} width={"100%"} onClick={secondAction} {...(btn2Props || {})}>
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
  btn1Props?: {href ?: string } & Omit<FabProps, "children"|"sx">,
  btn2Props?: {href ?: string } & Omit<FabProps, "children"|"sx">,
  firstAction?: () => void,
  secondAction?: () => void,
  color?: 'primary' | 'secondary',
  action2Color?: 'primary' | 'secondary',
  stakedInfo: InfoStakeProps,
  rewardInfo: InfoStakeProps,
}

type InfoStakeProps = {
  title: string,
  amount: string | React.ReactNode,
  currency?:string,
  subtitle: string | React.ReactNode,
  color?: 'primary' | 'secondary',
  comingSoon?: boolean
}

const InfoMoney = ( props: InfoStakeProps ) => {
  const { title, subtitle, currency, amount, color, comingSoon } = props
  const css = useMoneyStyles(props)
  return <>
    <Typography variant="body2" color="textSecondary" className={ css.general }>
      {title}
    </Typography>
    <div>
      <Typography color={color || 'primary'} display="inline" className={ css.currency }>
        {currency}
        <Typography className={ css.value } display="inline" component="span">
          { comingSoon ? "COMING SOON" : amount }
        </Typography>
      </Typography>
    </div>
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
    [theme.breakpoints.down('md')]:{
      fontSize: theme.typography.h5.fontSize
    }
  },
  titleGrid:{
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]:{
      marginBottom: theme.spacing(2),
    }
  }
}))
const useMoneyStyles = makeStyles<Theme,InfoStakeProps>( theme => createStyles({
  currency:{
    fontWeight: 500,
    fontSize: theme.typography.h5.fontSize,
  },
  value:{
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 500,
    paddingLeft: props => props.currency ? theme.spacing(1) : 0,
  },
  general:{
    opacity: 0.75,
  },
}))