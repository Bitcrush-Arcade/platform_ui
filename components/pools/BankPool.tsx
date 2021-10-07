import { useState, useEffect, useMemo } from 'react'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Avatar from "@material-ui/core/Avatar"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import IconButton from '@material-ui/core/IconButton'
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
// Bitcrush
import Button from "components/basics/GeneralUseButton"
import Card from "components/basics/Card"
import InvaderLauncher from 'components/pools/bank/InvaderLauncher'
import RoiModal from 'components/pools/RoiModal'
import SmBtn from "components/basics/SmallButton"
import StakeModal, { StakeOptionsType, SubmitFunction } from "components/basics/StakeModal"
// Hooks
import useBank from "hooks/bank"
import useCoin from 'hooks/useCoin'
import { useTransactionContext } from 'hooks/contextHooks'
import { currencyFormat } from 'utils/text/text'
// Icons
import CalculationIcon from 'components/svg/CalculationIcon'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import InvaderIcon from "components/svg/InvaderIcon"
import RefreshIcon from '@material-ui/icons/Refresh'
// Libs
import { toWei } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'

function BankPool( ) {
  const css = useStyles()
  const { account } = useWeb3React()
  const { tokenInfo, hydrateToken, editTransactions } = useTransactionContext()
  const { bankInfo, userInfo, addresses, bankMethods, stakingMethods, hydrateData, getApyData } = useBank()
  const { approve, isApproved, getApproved } = useCoin()

  // CHECK ALLOWANCE OF STAKING CONTRACT
  useEffect(() => {
    if(!addresses?.staking) return
    getApproved(addresses.staking)
  }, [getApproved, addresses])

  const [ openStaking, setOpenStaking ] = useState(false)
  const [ showRoi, setShowRoi ] = useState(false)

  const toggleRoi = () => setShowRoi( p => !p )

  const stakingOptions : Array<StakeOptionsType> = [
    { name: 'Stake', btnText: 'Wallet', description: 'Stake your CRUSH into the Bankroll for APY rewards and house profit.',
      maxValue: tokenInfo.weiBalance },
    { name: 'Withdraw', btnText: 'Max', description: 'Withdraw your staked CRUSH from Bankroll. Sad to see you go :(',
      maxValue: userInfo.staked - userInfo.frozenStake },
    { name: 'Transfer', btnText: 'Rewarded', description: 'Transfer your staked CRUSH to the Live Wallet and gamble for more rewards!',
      maxValue: userInfo.staked },
  ]

  const submit : SubmitFunction = ( values, {setSubmitting}) => {
    const weiValue = toWei(`${new BigNumber(values.stakeAmount).toFixed(18,1)}`)
    if(!stakingMethods) return setSubmitting(false)
    if(!values.actionType)
      return stakingMethods.enterStaking(weiValue).send({ from: account })
        .on('transactionHash', (tx) => {
          console.log('hash', tx )
          editTransactions(tx,'pending', { description: `Stake in Bankroll`})
          setOpenStaking(false)
        })
        .on('receipt', ( rc) => {
          console.log('receipt',rc)
          editTransactions(rc.transactionHash,'complete')
          hydrateToken()
          hydrateData()
        })
        .on('error', (error, receipt) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        })
    const isTransfer = values.actionType === 2
    return stakingMethods.leaveStaking(weiValue, isTransfer).send({ from: account })
      .on('transactionHash', (tx) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: isTransfer ? 'Transfer to LiveWallet' :`Withdraw from BankRoll`})
        setOpenStaking(false)
      })
      .on('receipt', ( rc) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        hydrateToken()
        hydrateData()
      })
      .on('error', (error, receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  }

  const totalBankroll = new BigNumber(bankInfo.totalStaked).plus( new BigNumber(bankInfo.totalBankroll) ).toNumber()
  const usdBankRoll = currencyFormat(tokenInfo.crushUsdPrice * totalBankroll, { decimalsToShow: 2, isWei: true })

  // STAKING INTERACTIONS
  const depositWithdrawClick = () => {
    if(!isApproved)
      return approve(addresses.staking)
    setOpenStaking(true)
  }

  const profitDistribution = useMemo(() =>{
    const reward = bankInfo.profitTotal.total * userInfo.stakePercent
    if(reward > bankInfo.profitTotal.remaining)
      return 0
    return reward
  },[bankInfo, userInfo])

  const houseEdgePercent = useMemo(() => {
    if(!bankInfo.poolStart)
      return 0
      // Total_distributed * 365_days / ( Days_since_Start * total_pool )
    return new BigNumber( bankInfo.bankDistributed ).times( 365 ).div( new BigNumber( bankInfo.totalStaked ).times( differenceInCalendarDays( bankInfo.poolStart, new Date() ) || 1 ).toNumber() || 1  ).toNumber()
  },[bankInfo])

  return (<>
    <Card className={ css.card } background="light">
      <Grid container justifyContent="space-evenly">
        {/* STAKE INTERACTIVE AREA */}
        <Grid item xs={12} md={5}>
          <Grid container justifyContent="space-between" className={ css.spacing }>
            <Grid item>
              <Typography variant="h4" component="div" className={ css.heavier }>
                AUTO BITCRUSH V2&nbsp;&nbsp;
                <Tooltip title={`
                  BankPOOL, Stake your CRUSH here to add to the Bankroll.
                  MORE INFO NEEDED
                `}>
                  <InfoOutlinedIcon/>
                </Tooltip>
              </Typography>
            </Grid>
            <Grid item>
              <Avatar className={ css.avatar }>
                <InvaderIcon className={ css.avatarIcon} />
              </Avatar>
            </Grid>
          </Grid>
          <Grid container justifyContent="space-between" className={ css.spacing }>
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                Staked
              </Typography>
              <Typography variant="h6" component="div" color="primary" className={ css.heavy }>
                {currencyFormat(userInfo.staked, { isWei: true })}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Your Stake {currencyFormat( userInfo.stakePercent , { decimalsToShow: 6 })}%
              </Typography>
            </Grid>
          </Grid>
          <Button color="primary" onClick={depositWithdrawClick} width="100%">
            {isApproved ? "DEPOSIT / WITHDRAW" : "Approve CRUSH" }
          </Button>
        </Grid>
        {/* STAKE INFORMATION AREA */}
        <Grid item xs={12} md={5} className={ css.secondQuadrant }>
          <Grid container alignItems="center" justifyContent="space-around">
            <Grid item>
              <Typography color="textPrimary" variant="body2">
                APY &nbsp;
                <IconButton size="small" onClick={getApyData}>
                  <RefreshIcon fontSize="inherit"/>
                </IconButton>
                <IconButton size="small" onClick={toggleRoi}>
                  <CalculationIcon fontSize="inherit"/>
                </IconButton>
              </Typography>
              <Typography color="primary" variant="h6" component="div">
                {bankInfo.apyPercent?.d365?.percent}
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
                {(houseEdgePercent*100).toFixed(4)}%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={'auto'}>
              <Typography color="secondary" variant="h6" component="div" align="center">
                =
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="secondary" variant="h4" component="div">
                {(parseFloat(bankInfo.apyPercent?.d365?.percent.replace(/[^.\d]/g,'')) || 0) + (bankInfo.profitDistribution * 100)}%
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider className={ css.divider }/>
            </Grid>
            <Grid item xs={12}>
              <Typography color="textSecondary" variant="body2">
                Crush Earned
              </Typography>
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Typography>APY Rewards</Typography>
                </Grid>
                <Grid item>
                  <Typography color="primary">
                    {currencyFormat(userInfo.stakingReward, { isWei: true })}
                  </Typography>
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
                  {/* IF REWARD > profit[0].remaining then 0 */}
                  <Typography color="primary">{currencyFormat(profitDistribution, { isWei: true })}</Typography>
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
                    {currencyFormat( profitDistribution + userInfo.stakingReward, { isWei: true })}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* INVADER LAUNCHER */}
        <Grid item xs={12} md={5} style={{ paddingTop: 32, overflow: 'hidden'}}>
          <InvaderLauncher percent={bankInfo.thresholdPercent} crushBuffer={bankInfo.availableProfit}/>
        </Grid>
        {/* BANKROLL INFO */}
        <Grid item xs={12} md={5}>
          <Divider className={ css.divider } />
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography>
                Total Bankroll:
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="primary" align="right" variant="h6" component="div">
                {currencyFormat(totalBankroll, { isWei: true })}
              </Typography>
              <Typography color="textSecondary" variant="caption" component="div" align="right">
                {usdBankRoll} USD
              </Typography>
            </Grid>            
            <Grid item xs={12} className={ css.invisibleDivider } />
            <Grid item>
              <Typography>
                House Profit Distributed:
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="primary" align="right" variant="h6" component="div">
                {currencyFormat( bankInfo.bankDistributed, { isWei: true })}
              </Typography>
              <Typography color="textSecondary" variant="caption" component="div" align="right">
                {currencyFormat( bankInfo.bankDistributed * tokenInfo.crushUsdPrice, { isWei: true, decimalsToShow: 2} )}
              </Typography>
            </Grid>
            <Grid item xs={12} className={ css.invisibleDivider } />
            <Grid item>
              <Typography>
                Total Value Distributed:
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="primary" align="right" variant="h6" component="div">
                {currencyFormat( bankInfo.stakingDistruted , { isWei: true })}
              </Typography>
              <Typography color="textSecondary" variant="caption" component="div" align="right">
                {currencyFormat( bankInfo.stakingDistruted * tokenInfo.crushUsdPrice , { isWei: true, decimalsToShow: 2} )}
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
    <RoiModal
      open={showRoi}
      onClose={toggleRoi}
      tokenSymbol="CRUSH"
      tokenLink={"https://dex.apeswap.finance/#/swap"}
      apyData={bankInfo.apyPercent}
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