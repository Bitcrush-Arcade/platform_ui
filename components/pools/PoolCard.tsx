import { useState } from 'react'
// web3
import { useWeb3React } from '@web3-react/core'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Avatar from "@material-ui/core/Avatar"
import ButtonBase from "@material-ui/core/ButtonBase"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import Collapse from "@material-ui/core/Collapse"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
// Material Icons
import ArrowIcon from '@material-ui/icons/ArrowDropDownCircleOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import RefreshIcon from '@material-ui/icons/Refresh'
// Bitcrush
import Card from 'components/basics/Card'
// Icons
import CalculationIcon from 'components/svg/CalculationIcon'
import InvaderIcon from 'components/svg/InvaderIcon'
// utils
import { currencyFormat } from 'utils/text/text'
import Button from 'components/basics/GeneralUseButton'
import SmallButton from 'components/basics/SmallButton'

const PoolCard = (props: PoolProps) => {

  const [ detailOpen, setDetailOpen ] = useState<boolean>(false)


  const css = useStyles({})

  const amount = 0.00025423

  return <Card background="light" className={ css.card } >
    <CardHeader classes={{ action: css.headerAction }}
      title="Auto Bitcrush"
      titleTypographyProps={{ className: css.headerTitle }}
      subheader="Automatic restaking"
      subheaderTypographyProps={{ variant: 'body2' }}
      action={
        <Avatar className={css.avatar}>
          <InvaderIcon className={ css.avatarIcon }/>
        </Avatar>
      }
    />
    <CardContent>
      {/* APR */}
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Typography color="textSecondary" variant="body2" >
            APR:
          </Typography>
        </Grid>
        <Grid item>
          <ButtonBase>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Typography color="primary" variant="body2" className={ css.percent }>
                  150%
                </Typography>
              </Grid>
              <Grid item>
                <CalculationIcon className={ css.aprAction }/>
              </Grid>
            </Grid>
          </ButtonBase>
        </Grid>
      </Grid>
      <Grid container justify="space-between" alignItems="flex-end" className={ css.earnings }>
        <Grid item>
          <Typography variant="body2" color="textSecondary">
            CRUSH EARNED
          </Typography>
          <Typography variant="h5" component="div" color="primary">
            {currencyFormat(amount, { decimalsToShow: 8 })}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            $&nbsp;{currencyFormat(amount, { decimalsToShow: 2 })} USD
          </Typography>
        </Grid>
        <Grid item>
          <Button color="secondary" size="small" style={{fontWeight: 400}} width="96px">
            Harvest
          </Button>
        </Grid>
      </Grid>
      <Button width="100%" color="primary">
        STAKE
      </Button>
    </CardContent>
    <CardActions>
      <Grid container>
        <Grid item xs={12}>
          <Divider style={{marginBottom: 24}}/>
        </Grid>
        <Grid item xs={6} container alignItems="center">
          <SmallButton size="small" color="primary" style={{marginRight: 8}}>
            <RefreshIcon fontSize="inherit" color="primary" style={{marginRight: 8}}/>Manual
          </SmallButton>
          <InfoOutlinedIcon color="disabled"/>
        </Grid>
        <Grid item xs={6} container alignItems="center" justify="flex-end">
          <ButtonBase onClick={ () => setDetailOpen( p => !p )}>
            <Typography variant="body2" color="primary" className={ css.detailsActionText }>
              Details
            </Typography>
            <ArrowIcon fontSize="small" color={detailOpen ? "primary" : "disabled"} style={{ transform: `rotate(${ detailOpen ? "180deg" : "0deg"})`}}/>
          </ButtonBase>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={detailOpen}>
            COLLAPSED INFO
          </Collapse>
        </Grid>
      </Grid>
    </CardActions>
  </Card>
}

export default PoolCard

type PoolProps = {
  abi: any,
  contract: string, // address
  tokenAddress ?: string //address
}

const useStyles = makeStyles<Theme>( theme => createStyles({
  card:{
    width: 385,
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  avatar:{
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundColor: theme.palette.primary.main
  },
  avatarIcon:{
    fontSize: 30,
    color: theme.palette.common.white
  },
  headerTitle:{
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  headerAction:{
    alignSelf: 'center'
  },
  percent:{
    fontWeight: 600
  },
  aprAction:{
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.primary.main
  },
  earnings:{
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  detailsActionText:{
    fontWeight: 500,
    marginRight: theme.spacing(1)
  }
}))