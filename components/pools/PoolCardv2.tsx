import { useState, useEffect, useCallback } from  'react'
// Material
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Avatar from '@mui/material/Avatar'
import ButtonBase from "@mui/material/ButtonBase"
import MButton from "@mui/material/Button"
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CircularProgress from "@mui/material/CircularProgress"
import Divider from "@mui/material/Divider"
import Grid from '@mui/material/Grid'
import IconButton from "@mui/material/IconButton"
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
// Icons
import RefreshIcon from '@mui/icons-material/Refresh'
import CalculationIcon from 'components/svg/CalculationIcon'
import InvaderIcon from 'components/svg/InvaderIcon'
// BitcrushUI
import Button from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import RoiModal, { RoiProps } from 'components/pools/RoiModal'
import StakeModal, { StakeOptionsType, SubmitFunction } from 'components/basics/StakeModal'
// Libs
import { useContract } from 'hooks/web3Hooks'
import { useTransactionContext } from 'hooks/contextHooks'
import { currencyFormat } from 'utils/text/text'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import useCoin from 'hooks/useCoin'
import { getContracts } from 'data/contracts'
import { toWei } from 'web3-utils'
import { Receipt } from 'types/PromiEvent';

BigNumber.config({ DECIMAL_PLACES: 18 })

type PoolCardProps = {
  name: string,
  subtext: string,
  tokenIcon?: React.ReactNode,
  address: string,
  abi: any,
}


const Poolv2 = ( props: PoolCardProps ) => {

  const { name, subtext, tokenIcon, address, abi } = props
  const { account, chainId } = useWeb3React()
  const { address: coinAddress } = getContracts('crushToken', chainId)
  const { methods: poolMethods } = useContract(abi, address)

  const [poolData, setPoolData] = useState<{ staked?: BigNumber, totalStaked?: BigNumber, earned?: BigNumber, poolExhausted?: boolean}>({})
  const [apyInfo, setApyInfo] = useState<any>({})
  const [openRoi, setOpenRoi] = useState<boolean>(false)
  const [openStakeModal, setOpenStakeModal] = useState<boolean>(false)
  const { approve, isApproved, getApproved } = useCoin(coinAddress)
  const { tokenInfo, editTransactions } = useTransactionContext()

  const toggleRoi = () => setOpenRoi(p => !p)
  const toggleStakeModal = () => setOpenStakeModal(p => !p)

  const css = useStyles()

  const getAPY = useCallback(() => {
    fetch('api/bankAPY',{
      method: "POST",
      body: JSON.stringify({
        chainId: chainId,
        prev: true
      })
    })
    .then( resp => resp.json() )
    .then( data => setApyInfo( data.compoundRewards ))
  },[setApyInfo, chainId])

  const getPoolData = useCallback( async () =>{
    if(!poolMethods || !account) return
    const stakingInfo = await poolMethods.stakings( account ).call()
    const totalStaked = await poolMethods.totalStaked().call()
    const apyReward = await poolMethods.pendingReward( account ).call()
    const profitReward = await poolMethods.pendingProfits( account ).call()
    const poolReward = await poolMethods.totalPool().call()
    setPoolData({
      staked: new BigNumber(stakingInfo.stakedAmount),
      totalStaked: new BigNumber( totalStaked ),
      earned: new BigNumber( apyReward ).plus( profitReward ),
      poolExhausted: new BigNumber(poolReward).isEqualTo(0)
    })
  },[poolMethods, account, setPoolData])

  useEffect( ()=>{
    if(!poolMethods || !account) return
    const interval  = setInterval(getPoolData, 3000)
    return () => clearInterval(interval)

  },[poolMethods, setPoolData, account, getPoolData])

  useEffect( () => {
    getApproved && getApproved(address)
    getAPY && getAPY()
  },[getAPY,getApproved, address])

  const percent = new BigNumber( poolData.staked || 0 ).div( poolData.totalStaked  || 1).toString()

  const openStake = () => {
    if(!isApproved)
      return approve( address )
    toggleStakeModal()
  }

  const stakeOptions: Array<StakeOptionsType> = [
    {
      name: 'Stake',
      maxValue: tokenInfo.weiBalance,
      btnText: 'Wallet',
      description: "Stake your CRUSH on this high yield pool",
      disableAction: true
    },
    {
      name: 'Withdraw',
      maxValue: poolData.staked || new BigNumber(0),
      btnText: 'Staked',
      description: "Withdraw your staked CRUSH into your wallet",
    }
  ]

  const submitFn : SubmitFunction = ( values, {setSubmitting}) => {
    const weiValue = toWei(`${new BigNumber(values.stakeAmount).toFixed(18,1)}`)
    if(!poolMethods) return setSubmitting(false)
    if(!values.actionType)
      return poolMethods.enterStaking(weiValue).send({ from: account })
        .on('transactionHash', (tx:string) => {
          console.log('hash', tx )
          editTransactions(tx,'pending', { description: `Stake in Bankroll`})
        })
        .on('receipt', ( rc:Receipt) => {
          console.log('receipt',rc)
          editTransactions(rc.transactionHash,'complete')
          getPoolData()
          getAPY()
          toggleStakeModal()
        })
        .on('error', (error: any, receipt:Receipt) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        })
    return poolMethods.emergencyWithdraw().send({ from: account })
      .on('transactionHash', (tx:string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Withdraw All from Staking`})
      })
      .on('receipt', ( rc:Receipt) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        getPoolData()
        getAPY()
        toggleStakeModal()
      })
      .on('error', (error: any, receipt:Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  }

  return <>
  <Card background="light" className={ css.card } >
      <CardHeader classes={{ action: css.headerAction }}
        title={name}
        titleTypographyProps={{ className: css.headerTitle }}
        subheader={subtext}
        subheaderTypographyProps={{ variant: 'body2' }}
        action={
          tokenIcon || <Avatar className={css.avatar}>
            <InvaderIcon className={ css.avatarIcon }/>
          </Avatar>
        }
      />
      <CardContent>
        {/* APR */}
        {/* <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography color="textSecondary" variant="body2" >
              Staked
            </Typography>
          </Grid>
          <Grid item xs={12}/>
          <Grid item>
            <Typography color="primary" variant="body2" style={{fontWeight: 500}}>
              {currencyFormat(poolData.staked?.toString() || 0, { isWei: true })}
            </Typography>
          </Grid>
          <Grid item>
            <Typography color="textSecondary" variant="body2" >
              Your stake&nbsp;{currencyFormat( percent, { decimalsToShow: 6 }) }%
            </Typography>
          </Grid>
          <Grid item xs={12}/>
          <Grid item>
            <Typography color="textSecondary" variant="body2" >
              APY:
            </Typography>
          </Grid>
          <Grid item>
            <ButtonBase onClick={toggleRoi}>
              <Grid container alignItems="center">
                <Grid item style={{paddingRight: 8}}>
                  { apyInfo?.d365?.percent 
                    ? <Typography color="primary" variant="body2" className={ css.percent }>
                        {currencyFormat(apyInfo?.d365?.percent * 100, { decimalsToShow: 2 })}%
                      </Typography>
                    : <Skeleton className={css.percent} animation="wave" height={20} width={80} />
                  }
                </Grid>
                <Grid item style={{paddingRight: 4}}>
                  <CalculationIcon className={ css.aprAction }/>
                </Grid>
              </Grid>
            </ButtonBase>
            <IconButton size="small" color="primary" onClick={getAPY} >
              <RefreshIcon fontSize="inherit"/>
            </IconButton>
          </Grid>
        </Grid> */}
        <Grid container justifyContent="space-between" alignItems="flex-end" className={ css.earnings }>
          <Grid item>
            <Typography variant="body2" color="textSecondary">
              STAKED CRUSH
            </Typography>
            <Typography variant="h5" component="div" color="primary">
              { currencyFormat(poolData.staked?.toString() || 0, { isWei: true }) }
            </Typography>
            <Typography variant="body2" color="textSecondary">
              $&nbsp;{currencyFormat(poolData.staked?.times(tokenInfo.crushUsdPrice).toString() || 0, { isWei: true, decimalsToShow: 3 }) } USD
            </Typography>
          </Grid>
        </Grid>
        <Button width="100%" color="primary" onClick={openStake} solidDisabledText disabled={!isApproved}
        >
          { account 
              ? "Withdraw NOW"
              : "Unlock Wallet"}
        </Button>
      </CardContent>
      <CardActions>
        <Grid container>
          <Grid item xs={12}>
            <Divider style={{marginBottom: 24}}/>
          </Grid>
          <Grid item xs={12} container alignItems="center">
                <Typography variant="h6" component="div" color="textSecondary" style={{fontWeight: 600}}>
                  EXHAUSTED, WITHDRAW NOW
                </Typography>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
    <RoiModal
      open={openRoi}
      tokenSymbol="CRUSH"
      tokenLink=""
      onClose={toggleRoi}
      apyData={apyInfo}
    />
    <StakeModal
      initAction={1}
      open={openStakeModal}
      onClose={toggleStakeModal}
      options={stakeOptions}
      onSubmit={submitFn}
      coinInfo={{ symbol: 'CRUSH', decimals: 18, name: "Crush Token"}}
    />
  </>

}

export default Poolv2

const useStyles = makeStyles<Theme>( theme => createStyles({
  card:{
    maxWidth: 385,
    width: '100%',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  avatar:{
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundColor: theme.palette.error.main
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
    marginTop: 0,
    marginBottom: theme.spacing(3),
  },
  detailsActionText:{
    fontWeight: 500,
    marginRight: theme.spacing(1)
  },
  textField:{
    borderRadius: theme.spacing(4),
    paddingLeft: theme.spacing(1),
  },
  submitBtn:{
    marginTop: theme.spacing(2)
  },
  tooltips:{
    padding: `${theme.spacing(2)}`
  },
  stakeActionBtn:{
    fontWeight: 600,
  },
  stakeActionBtnContainer:{
    marginBottom: theme.spacing(0.5),
  },
  currentTokenText:{
    marginBottom: theme.spacing(1.5),
    paddingRight: theme.spacing(2)
  },
  sliderContainer:{
    padding: theme.spacing(2),
  },
}))