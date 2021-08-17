import { useState } from 'react'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Avatar from "@material-ui/core/Avatar"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
// Bitcrush
import Button from "components/basics/GeneralUseButton"
import Card from "components/basics/Card"
import InvaderLauncher from 'components/pools/bank/InvaderLauncher'
import SmBtn from "components/basics/SmallButton"
import StakeModal, { StakeOptionsType } from "components/basics/StakeModal"
// Hooks
import useBank from "hooks/bank"
// Icons
import InvaderIcon from "components/svg/InvaderIcon"

function BankPool( ) {
  const css = useStyles()

  const { bankInfo, userInfo } = useBank()
  const [ openStaking, setOpenStaking ] = useState(false)

  const stakingOptions : Array<StakeOptionsType> = [
    // { name: 'Stake', description: 'Wallet', maxValue: userInfo.staked },
    // { name: 'Withdraw', description: 'Staked', maxValue: userInfo.staked },
    // { name: 'Transfer', description: 'Rewarded', maxValue: userInfo.stakingReward + userInfo.edgeReward },
    { name: 'Stake', btnText: 'Wallet', description: 'Stake your CRUSH into the Bankroll for APY rewards and house profit.',
      maxValue: 12044457798131585796 },
    { name: 'Withdraw', btnText: 'Staked', description: 'Withdraw your staked CRUSH from Bankroll. Sad to see you go :(',
      maxValue: 150000000000000000 },
    { name: 'Transfer', btnText: 'Rewarded', description: 'Transfer your staked CRUSH to the Live Wallet and gamble for more rewards!',
      maxValue: 14000000000000000000 },
  ]
  const submit = ( values, {setSubmitting}) => {
    console.log('here\'s the values', values)
    setSubmitting(false)
  }

  return (<>
    <Card className={ css.card } background="light">
      <Grid container justify="space-evenly">
        {/* STAKE INTERACTIVE AREA */}
        <Grid item xs={12} md={5}>
          <Grid container justify="space-between" className={ css.spacing }>
            <Grid item>
              <Typography variant="h4" component="div" className={ css.heavier }>
                AUTO BITCRUSH V2
              </Typography>
            </Grid>
            <Grid item>
              <Avatar className={ css.avatar }>
                <InvaderIcon className={ css.avatarIcon} />
              </Avatar>
            </Grid>
          </Grid>
          <Grid container justify="space-between" className={ css.spacing }>
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                Staked
              </Typography>
              <Typography variant="h6" component="div" color="primary" className={ css.heavy }>
                {userInfo.staked}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Your Stake {userInfo.staked / ( bankInfo.bankRoll || 1 )}%
              </Typography>
            </Grid>
            <Grid item>
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <SmBtn color="primary">
                    Compound
                  </SmBtn>
                </Grid>
                <Grid item>
                  <SmBtn color="primary" >
                    Harvest
                  </SmBtn>
                </Grid>
                <Grid item>
                  <SmBtn color="primary">
                    Transfer
                  </SmBtn>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Button color="primary" onClick={() => setOpenStaking(true)} width="100%">
            DEPOSIT / WITHDRAW
          </Button>
        </Grid>
        {/* STAKE INFORMATION AREA */}
        <Grid item xs={12} md={5} className={ css.secondQuadrant }>
          <Grid container alignItems="center" justify="space-around">
            <Grid item>
              <Typography color="textPrimary" variant="body2">
                APY
              </Typography>
              <Typography color="primary" variant="h6" component="div">
                percent%
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="primary" variant="h6" component="div">
                +
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="textPrimary" variant="body2">
                Profit Distribution
              </Typography>
              <Typography color="primary" variant="h6" component="div">
                percent%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={'auto'}>
              <Typography color="secondary" variant="h6" component="div" align="center">
                =
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="secondary" variant="h4" component="div">
                940.2523%
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider className={ css.divider }/>
            </Grid>
            <Grid item xs={12}>
              <Typography color="textSecondary" variant="body2">
                Crush Earned
              </Typography>
              <Grid container justify="space-between">
                <Grid item>
                  <Typography>APY Rewards</Typography>
                </Grid>
                <Grid item>
                  <Typography color="primary">CRUSH STAKING REWARD</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color="primary">
                    +
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>Profit Distribution</Typography>
                </Grid>
                <Grid item>
                  <Typography color="primary">CRUSH EDGE REWARD</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color="secondary">
                    =
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h5" color="secondary">
                    Total Reward
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography color="secondary" variant="h5">
                    TOTALREWARDCRUSH
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* INVADER LAUNCHER */}
        <Grid item xs={12} md={5} style={{ paddingTop: 32, overflow: 'hidden'}}>
          <InvaderLauncher percent={95} crushBuffer={199.5}/>
        </Grid>
        {/* BANKROLL INFO */}
        <Grid item xs={12} md={5}>
          <Divider className={ css.divider } />
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography>
                Total Bankroll:
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="primary" align="right" variant="h6" component="div">
                BANKROLLAMOUNT
              </Typography>
              <Typography color="textSecondary" variant="caption" component="div" align="right">
                BANKROLLAMOUNT USD
              </Typography>
            </Grid>
            <Grid item xs={12} className={ css.invisibleDivider } />
            <Grid item>
              <Typography>
                Total Value Distributed:
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="primary" align="right" variant="h6" component="div">
                TVLDistributed
              </Typography>
              <Typography color="textSecondary" variant="caption" component="div" align="right">
                TVL USD
              </Typography>
            </Grid>
            <Grid item xs={12} className={ css.invisibleDivider } />
            <Grid item>
              <Typography>
                House Profit Distribution:
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="primary" align="right" variant="h6" component="div">
                ProfitDistributedAmount
              </Typography>
              <Typography color="textSecondary" variant="caption" component="div" align="right">
                PROFITDISTRITBUTED USD
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
    <StakeModal
      open={openStaking}
      onClose={()=> setOpenStaking(false)}
      options={ stakingOptions }
      coinInfo={ { symbol: 'CRUSH', name: 'Crush Coin'} }
      onSubmit={ submit }
    />
  </>)
}

export default BankPool

const useStyles = makeStyles<Theme>( theme => createStyles({
  actionBtns:{
    marginTop: theme.spacing(2)
  },
  avatar:{
    backgroundColor: theme.palette.primary.main,
    width: 36,
    height: 36,
  },
  avatarIcon:{
    color: theme.palette.common.white
  },
  card:{
    width: '100%',
    [theme.breakpoints.up('md')]:{
      width: '80%',
    },
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
  },
  heavy:{
    fontWeight: 500
  },
  heavier:{
    fontWeight: 600
  },
  icnBtn:{
    border: `1px solid ${theme.palette.primary.main}`,
    padding: 8,
    background: `radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%,${theme.palette.shadow.primary.main} 80%, ${theme.palette.shadow.primary.main} 85%)`
  },
  addIcn:{
    borderTopRightRadius: 0,
  },
  removeIcn:{
    borderTopLeftRadius: 0,
  },
  divider:{
    height: 1,
    backgroundColor: theme.palette.primary.main,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  invisibleDivider:{
    height: theme.spacing(2)
  },
  secondQuadrant:{
    [theme.breakpoints.down('sm')]:{
      marginTop: theme.spacing(2)
    }
  },
  coinText:{
    fontFamily: 'Zebulon',
    letterSpacing: 2,
    [theme.breakpoints.down('md')]:{
      fontSize: theme.typography.body1.fontSize
    }
  },
  spacing:{
    marginBottom: theme.spacing(2),
  }
}))