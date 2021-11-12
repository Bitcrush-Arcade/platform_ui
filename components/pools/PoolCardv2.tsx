import { useState, useEffect, useCallback } from  'react'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import ButtonBase from "@material-ui/core/ButtonBase"
import MButton from "@material-ui/core/Button"
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import CircularProgress from "@material-ui/core/CircularProgress"
import Divider from "@material-ui/core/Divider"
import Grid from '@material-ui/core/Grid'
import IconButton from "@material-ui/core/IconButton"
import Skeleton from "@material-ui/lab/Skeleton"
import Typography from '@material-ui/core/Typography'
// Icons
import RefreshIcon from '@material-ui/icons/Refresh'
import CalculationIcon from 'components/svg/CalculationIcon'
import InvaderIcon from 'components/svg/InvaderIcon'
// BitcrushUI
import Button from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import RoiModal, { RoiProps } from 'components/pools/RoiModal'
import StakeModal, { StakeOptionsType, StakeModalProps } from 'components/basics/StakeModal'
// Libs
import { useContract } from 'hooks/web3Hooks'
import { useTransactionContext } from 'hooks/contextHooks'
import { currencyFormat } from 'utils/text/text'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import useCoin from 'hooks/useCoin'
import { getContracts } from 'data/contracts'

BigNumber.config({ DECIMAL_PLACES: 18 })

type PoolCardProps = {
  name: string,
  subtext: string,
  tokenIcon?: React.ReactNode,
  address: string,
  abi: any,
  earnedFnName?: string,
  earnedFn?: (methods: any) => BigNumber,
  secondaryFn?: {
    name: string,
    action: () => void,
  },
  apyData:any,
  refreshApy: () => void,
  cardOtherActions?: React.ReactNode,
}


const Poolv2 = ( props: PoolCardProps ) => {

  const { name, subtext, tokenIcon, address, abi, apyData, refreshApy} = props
  const { account, chainId } = useWeb3React()
  const { address: coinAddress } = getContracts('crushToken', chainId)
  const { methods: poolMethods } = useContract(abi, address)

  const [poolData, setPoolData] = useState<{ staked?: BigNumber, totalStaked?: BigNumber, earned?: BigNumber}>({})
  const [apyInfo, setApyInfo] = useState<any>({})
  const [openRoi, setOpenRoi] = useState<boolean>(false)
  const [openStakeModal, setOpenStakeModal] = useState<boolean>(false)
  const { approve, isApproved } = useCoin(coinAddress)
  const { tokenInfo } = useTransactionContext()

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

  useEffect( ()=>{
    if(!poolMethods || !account) return
    const getPoolData = async () =>{
      const stakingInfo = await poolMethods.stakings( account ).call()
      const totalStaked = await poolMethods.totalStaked().call()
      const apyReward = await poolMethods.pendingReward( account ).call()
      const profitReward = await poolMethods.pendingProfits( account ).call()
      setPoolData({
        staked: new BigNumber(stakingInfo.stakedAmount),
        totalStaked: new BigNumber( totalStaked ),
        earned: new BigNumber( apyReward ).plus( profitReward )
      })
    }
    const interval  = setInterval(getPoolData, 3000)
    return () => clearInterval(interval)

  },[poolMethods, setPoolData, account])

  useEffect( () => {

  },[getAPY])

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
    },
    {
      name: 'Withdraw',
      maxValue: poolData.staked || new BigNumber(0),
      btnText: 'Staked',
      description: "Withdraw your staked CRUSH into your wallet",
    }
  ]

  const submitFn = ( values ) => {
    console.log('submit values', values)
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
        <Grid container justifyContent="space-between" alignItems="center">
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
        </Grid>
        <Grid container justifyContent="space-between" alignItems="flex-end" className={ css.earnings }>
          <Grid item>
            <Typography variant="body2" color="textSecondary">
              CRUSH EARNED
            </Typography>
            <Typography variant="h5" component="div" color="primary">
              { currencyFormat( poolData.earned?.toString() || 0 ,{ isWei: true, decimalsToShow: 4}) }
            </Typography>
            <Typography variant="body2" color="textSecondary">
              $&nbsp;{currencyFormat(poolData.earned?.times(tokenInfo.crushUsdPrice).toString() || 0, { isWei: true, decimalsToShow: 3 }) } USD
            </Typography>
          </Grid>
        </Grid>
        <Button width="100%" color="primary" onClick={openStake} solidDisabledText
        >
          { account 
              ? isApproved ? `STAKE CRUSH` : "Enable"
              : "Unlock Wallet"}
        </Button>
      </CardContent>
      <CardActions>
        <Grid container>
          <Grid item xs={12}>
            <Divider style={{marginBottom: 24}}/>
          </Grid>
          <Grid item xs={12} container alignItems="center">
            
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