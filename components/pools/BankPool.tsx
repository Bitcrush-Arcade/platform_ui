import { useState, useEffect, useCallback } from 'react'
import format from 'date-fns/format'
// Material
import { Theme, useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import useMediaQuery from '@mui/material/useMediaQuery'
import Avatar from "@mui/material/Avatar"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import IconButton from '@mui/material/IconButton'
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import Skeleton from '@mui/material/Skeleton'
// Bitcrush
import Button from "components/basics/GeneralUseButton"
import Card from "components/basics/Card"
import InfoTooltip from 'components/basics/InfoTooltip'
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InvaderIcon from "components/svg/InvaderIcon"
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
// Libs
import { bankStakingInfo, launcherTooltip } from 'data/texts'
import { toWei } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { Receipt } from 'types/PromiEvent';

function BankPool( ) {
  const css = useStyles()
  const { account } = useWeb3React()
  const { tokenInfo, hydrateToken, editTransactions } = useTransactionContext()
  const { bankInfo, userInfo, addresses, bankMethods, stakingMethods, hydrateData, getApyData } = useBank()
  const { approve, isApproved, getApproved } = useCoin()
  const theme = useTheme()
  const isSm = useMediaQuery( theme.breakpoints.down('md') )
  useEffect( () => {
    if(!getApyData) return
    const interval = setInterval( () => getApyData(), 30000)
    return () => {
      clearInterval( interval )
    }
  },[getApyData])
  // CHECK ALLOWANCE OF STAKING CONTRACT
  useEffect(() => {
    if(!addresses?.staking) return
    getApproved(addresses.staking)
  }, [getApproved, addresses])

  const [ openStaking, setOpenStaking ] = useState(false)
  const [ showRoi, setShowRoi ] = useState(false)
  const [ selectedOption, setSelectedOption ] = useState<number|undefined>(undefined)

  const toggleRoi = () => setShowRoi( p => !p )

  const stakingOptions : Array<StakeOptionsType> = [
    { name: 'Stake',
      btnText: 'Wallet',
      description: 'Stake your CRUSH into the Bankroll for APY rewards and house profit.',
      maxValue: tokenInfo.weiBalance
    },
    { name: 'Withdraw',
      btnText: 'Max',
      description: 'Withdraw your staked CRUSH from Bankroll. Sad to see you go :(',
      more: function moreDetails(vals) {
        return <>
        <Typography variant="caption" component="div" style={{ marginTop: 24 }}>
          Early withdraw fee of 0.5% if withdrawn before 72 hours.
        </Typography>
        {
          userInfo.frozenStake > 0 
          ? <Typography variant="caption" component="div" style={{ marginTop: 24 }}>
              Withdrawing while funds are frozen has a 15% fee to be added back into bankroll to help unfreeze.
              Withdraw and Transfer are locked to once every 3 hours.
            </Typography>
          : null
        }
        </>
      },
      maxValue: userInfo.staked - userInfo.frozenStake
    },
    { name: 'Transfer',
      btnText: 'Rewarded',
      description: 'Transfer your staked CRUSH to the Live Wallet and gamble for more rewards!',
      maxValue: userInfo.staked - userInfo.frozenStake,
      more: function moreDetails(vals) {
        return <>
        <Typography variant="caption" component="div" style={{ marginTop: 24 }}>
          Early withdraw fee of 0.5% if withdrawn before 72 hours.
        </Typography>
        {
          userInfo.frozenStake > 0 
          ? <Typography variant="caption" component="div" style={{ marginTop: 24 }}>
              Withdrawing while funds are frozen has a 15% fee to be added back into bankroll to help unfreeze.
              Withdraw and Transfer are locked to once every 3 hours.
            </Typography>
          : null
        }
        </>
      },
    },
  ]

  const submit : SubmitFunction = ( values, {setSubmitting}) => {
    const weiValue = toWei(`${new BigNumber(values.stakeAmount).toFixed(18,1)}`)
    if(!stakingMethods) return setSubmitting(false)
    if(!values.actionType)
      return stakingMethods.enterStaking(weiValue).send({ from: account })
        .on('transactionHash', (tx:string) => {
          console.log('hash', tx )
          editTransactions(tx,'pending', { description: `Stake in Bankroll`})
          setOpenStaking(false)
        })
        .on('receipt', ( rc: Receipt ) => {
          console.log('receipt',rc)
          editTransactions(rc.transactionHash,'complete')
          hydrateToken()
          hydrateData()
          getApyData()
        })
        .on('error', (error: any, receipt: Receipt ) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        })
    const isTransfer = values.actionType === 2
    return stakingMethods.leaveStaking(weiValue, isTransfer).send({ from: account })
      .on('transactionHash', (tx:string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: isTransfer ? 'Transfer to LiveWallet' :`Withdraw from BankRoll`})
        setOpenStaking(false)
      })
      .on('receipt', ( rc: Receipt) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        hydrateToken()
        hydrateData()
        getApyData()
      })
      .on('error', (error: any, receipt: Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  }

  const totalBankroll = new BigNumber(bankInfo.totalStaked).plus( new BigNumber(bankInfo.totalBankroll) ).toNumber()
  const usdBankRoll = currencyFormat(tokenInfo.crushUsdPrice * totalBankroll, { decimalsToShow: 2, isWei: true })

  // STAKING INTERACTIONS
  const depositWithdrawClick = useCallback(() => {
    if(!isApproved)
      return approve(addresses.staking)
    setOpenStaking(true)
  },[isApproved, approve, setOpenStaking, addresses.staking])

  useEffect( () => {
    if(isNaN( Number(selectedOption) ))
      return setOpenStaking(false)
    depositWithdrawClick()
  },[selectedOption, depositWithdrawClick])

  const launcherPercent = bankInfo.totalFrozen > 0 ? 0 : (bankInfo.profitsPending ? 100 : bankInfo.thresholdPercent)
  const activeSiren = userInfo.staked > 0 && launcherPercent >= 100
  
  return (<>
    <Card className={ css.card } background="light">
      <Grid container justifyContent="space-evenly">
        {/* STAKE INTERACTIVE AREA */}
        <Grid item xs={12} md={5}>
          <Grid container justifyContent="space-between" className={ css.spacing }>
            <Grid item>
              <Typography variant="h4" component="div" className={ css.heavier }>
                AUTO BITCRUSH V2&nbsp;&nbsp;
                <InfoTooltip 
                  tooltipProps={{
                    leaveDelay: 1000,
                    classes: { tooltip: css.tooltip },
                    placement: "top",
                    enterTouchDelay: 100,
                    leaveTouchDelay: 120000,
                  }}
                  info={
                    <Typography style={{maxWidth: '100%', maxHeight: '70vh', overflowY: 'scroll', padding: 16, whiteSpace: 'pre-line'}} align="left">
                      {bankStakingInfo}
                    </Typography>
                  }
                />
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
                &nbsp;
                { userInfo.frozenStake > 0 && <Tooltip arrow title={<Typography variant="caption" style={{ whiteSpace: 'pre-line'}}>Frozen Funds{'\n'}{currencyFormat( userInfo.frozenStake, { isWei: true } )}</Typography>}>
                  <Typography component="span" className={ css.frozen }>
                    ({currencyFormat( userInfo.frozenStake, { isWei: true, decimalsToShow: 4 } )})
                  </Typography>
                </Tooltip>}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Your Stake {currencyFormat( userInfo.stakePercent , { decimalsToShow: 6 })}%
              </Typography>
              {userInfo.staked > 0 && 
                <Tooltip arrow
                  title={<Typography>Rewards earned since last action on {userInfo.lastAction > 0 ? format( new Date(userInfo.lastAction), 'yyyy-MM-dd HH:mm' ) : 'NEVER'}</Typography>}
                >
                  <Typography variant="body1" color="textPrimary">
                    Rewards Earned USD {currencyFormat( (userInfo.edgeReward + userInfo.stakingReward)*tokenInfo.crushUsdPrice , { decimalsToShow: 3, isWei: true })}
                  </Typography>
                </Tooltip>
              }
            </Grid>
          </Grid>
          { isApproved 
            ? <Grid container justifyContent="center" spacing={2}>
              <Tooltip arrow title={<Typography>Stake</Typography>}>
                <Grid item xs="auto" md={3}>
                  { isSm 
                    ? <SmBtn  onClick={ () => setSelectedOption(0)}>
                        Stake
                      </SmBtn>
                    : 
                      <Button onClick={ () => setSelectedOption(0)} color="primary" width="100%">
                        <AddIcon/>
                      </Button>
                  }
                </Grid>
              </Tooltip>
              <Tooltip arrow title={<Typography>Withdraw</Typography>}>
                <Grid item xs="auto" md={3}>
                    { isSm 
                      ? <SmBtn disabled={!userInfo.staked} onClick={ () => setSelectedOption(1)} color="secondary">
                          Withdraw
                        </SmBtn>
                      : 
                        <Button onClick={ () => setSelectedOption(1)} color="secondary" disabled={!userInfo.staked} width="100%">
                          <RemoveIcon/>
                        </Button>
                    }
                </Grid>
              </Tooltip>
              <Tooltip arrow title={<Typography>Transfer</Typography>}>
                <Grid item xs="auto" md={3}>
                  { isSm 
                    ? <SmBtn disabled={!userInfo.staked} onClick={ () => setSelectedOption(1)}>
                        Transfer
                      </SmBtn>
                    : 
                        <Button onClick={ () => setSelectedOption(2)} color="primary" disabled={!userInfo.staked} width="100%">
                          <SwapHorizIcon/>
                        </Button>
                  }
                </Grid>
              </Tooltip>
              </Grid>
            : <Button color="primary" onClick={depositWithdrawClick} width="100%">
                Approve CRUSH
              </Button>
          }
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
              <Tooltip arrow
                title={ <Typography>During frozen times, APY rewards increased by 25%</Typography>} 
                disableHoverListener={!bankInfo.totalFrozen}
                disableTouchListener={!bankInfo.totalFrozen}
              >
                <Typography color="primary" variant="h6" component="div" className={`${css.apyPercent} ${(bankInfo.totalFrozen && bankInfo.apyPercent) ? css.siren : ""}` }>
                  { bankInfo.apyPercent ? 
                    `${currencyFormat(bankInfo.apyPercent?.d365?.percent * 100, { decimalsToShow: 2})}%`
                    : <Skeleton/>
                  }
                </Typography>
              </Tooltip>
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
                  { bankInfo.apyPercent ? 
                    `${currencyFormat(((bankInfo?.apyPercent?.b365?.percent || 0 )*100), { decimalsToShow: 2 })}%`
                    : <Skeleton/>
                  }
              </Typography>
            </Grid>
            <Grid item xs={12} sm={'auto'}>
              <Typography color="secondary" variant="h6" component="div" align="center">
                =
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="secondary" variant="h4" component="div">
                  { bankInfo.apyPercent ? 
                    `${currencyFormat((bankInfo.apyPercent?.d365?.percent + (bankInfo?.apyPercent?.b365?.percent || 0) )*100, { decimalsToShow: 2})}%`
                    : <Skeleton/>
                  }
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
                    {currencyFormat(userInfo.stakingReward, { isWei: true, decimalsToShow: 4 })}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color="primary">
                    +
                  </Typography>
                </Grid>
                <Grid item style={{ height: 25}}>
                  <Tooltip title={<Typography style={{padding: 8}}>Claim Auto Bounty!</Typography>} 
                    arrow
                    disableHoverListener={!activeSiren}
                    disableTouchListener={!activeSiren}
                    disableFocusListener={!activeSiren}
                  >
                    <Typography className={ activeSiren ? css.profitSiren : '' }>Profit Distribution</Typography>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Typography color="primary">{currencyFormat(userInfo.edgeReward,{ isWei: true, decimalsToShow: 4 })}</Typography>
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
                    {currencyFormat( userInfo.edgeReward + userInfo.stakingReward, { isWei: true, decimalsToShow: 4  })}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* INVADER LAUNCHER */}
        <Grid item xs={12} md={5} style={{ overflow: 'hidden'}}>
          <Grid container alignItems="center" style={{ marginBottom: 32}}>
            <Grid item xs={12}>
              <Divider className={ css.divider }/>
            </Grid>
            <Typography color="secondary" variant="h6">
              Profit Distribution Launcher&nbsp;
            </Typography>
            <InfoTooltip color="secondary"
              info={ <Typography style={{ padding: 16, whiteSpace: 'pre-line' }}>{launcherTooltip}</Typography>}
            />
          </Grid>
          <InvaderLauncher
            percent={ launcherPercent }
            crushBuffer={ bankInfo.availableProfit }
            frozen={ bankInfo.totalFrozen }
          />
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
                {currencyFormat(totalBankroll, { isWei: true, decimalsToShow: 4  })}
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
                {currencyFormat( bankInfo.bankDistributed, { isWei: true, decimalsToShow: 4  })}
              </Typography>
              <Typography color="textSecondary" variant="caption" component="div" align="right">
                {currencyFormat( bankInfo.bankDistributed * tokenInfo.crushUsdPrice, { isWei: true, decimalsToShow: 2} )} USD
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
                {currencyFormat( bankInfo.stakingDistributed , { isWei: true, decimalsToShow: 4  })}
              </Typography>
              <Typography color="textSecondary" variant="caption" component="div" align="right">
                {currencyFormat( bankInfo.stakingDistributed * tokenInfo.crushUsdPrice , { isWei: true, decimalsToShow: 2} )} USD
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
    <StakeModal
      open={openStaking}
      onClose={()=> {
        setOpenStaking(false)
        setSelectedOption(undefined)
      }}
      options={ stakingOptions }
      coinInfo={ { symbol: 'CRUSH', name: 'Crush Coin'} }
      onSubmit={ submit }
      initAction={selectedOption}
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
  "@keyframes profitSiren":{
    "0%": { 
      fontSize: theme.typography.body1.fontSize,
      color: theme.palette.text.primary,
    },
    "50%": { 
      color: 'teal',
      fontSize: `calc(${theme.typography.body1.fontSize} * 1.05)`,
    },
    "75%": { 
      color: theme.palette.secondary.light,
    },
    "100%": { 
      fontSize: theme.typography.body1.fontSize,
      color: theme.palette.text.primary,
    },
  },
  "@keyframes apySiren":{
    "0%": { 
      fontSize: theme.typography.h4.fontSize,
      color: theme.palette.primary.main,
    },
    "50%": { 
      color: 'pink',
      fontSize: `calc(${theme.typography.h4.fontSize} * 1.05)`,
    },
    "75%": { 
      color: theme.palette.secondary.light,
    },
    "100%": { 
      fontSize: theme.typography.h4.fontSize,
      color: theme.palette.primary.main,
    },
  },
  profitSiren:{
    animationName: '$profitSiren',
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount:'infinite',
  },
  siren:{
    animationName: '$apySiren',
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount:'infinite',
  },
  actionBtns:{
    marginTop: theme.spacing(2)
  },
  apyPercent:{
    height: `calc(${theme.typography.h4.fontSize} * 1.05)`
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
    background: `radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%,${theme.palette.shadow?.primary.main} 80%, ${theme.palette.shadow?.primary.main} 85%)`
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
  frozen:{
    color: theme.palette.blue?.main,
  },
  invisibleDivider:{
    height: theme.spacing(2)
  },
  secondQuadrant:{
    [theme.breakpoints.down('md')]:{
      marginTop: theme.spacing(2)
    }
  },
  coinText:{
    fontFamily: 'Zebulon',
    letterSpacing: 2,
    [theme.breakpoints.down('lg')]:{
      fontSize: theme.typography.body1.fontSize
    }
  },
  spacing:{
    marginBottom: theme.spacing(2),
  },
  tooltip:{
    width: '80vw',
    maxWidth: 900,
  },
}))