import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useImmer } from 'use-immer'
// web3
import { useWeb3React } from '@web3-react/core'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-mui'
// Material
import { Theme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Avatar from "@mui/material/Avatar"
import MButton from "@mui/material/Button"
import ButtonBase from "@mui/material/ButtonBase"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Slider, { SliderThumb } from '@mui/material/Slider'
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
// import TextField from '@mui/material/TextField'
// Material Icons
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh'
// Bitcrush
import Card from 'components/basics/Card'
import Button from 'components/basics/GeneralUseButton'
import RoiModal, { RoiProps } from 'components/pools/RoiModal'
import SmallButton from 'components/basics/SmallButton'
import { useTransactionContext } from 'hooks/contextHooks'
// Icons
import CalculationIcon from 'components/svg/CalculationIcon'
import InvaderIcon from 'components/svg/InvaderIcon'
// utils
import { currencyFormat } from 'utils/text/text'
import { useWithWallet } from 'hooks/unlockWithWallet'
import { useContract } from 'hooks/web3Hooks'
import BigNumber from 'bignumber.js'
import { toWei } from 'web3-utils'
import { Receipt } from 'types/PromiEvent'

const PoolCard = (props: PoolProps) => {
  const { abi, tokenAddress, contractAddress, tokenAbi, infoText } = props
  // Web3
  const { account, chainId } = useWeb3React()
  const { contract: coinContract, methods: coinMethods } = useContract(tokenAbi, tokenAddress)
  const { methods: mainMethods } = useContract(abi, contractAddress)
  // Context
  const { editTransactions, tokenInfo } = useTransactionContext()
  // State
  const [ detailOpen, setDetailOpen ] = useState<boolean>(false)
  const [ openStakeModal, setOpenStakeModal ] = useState<boolean>(false)
  const [ openRoi, setOpenRoi ] = useState<boolean>(false)
  const [ hydrate, setHydrate ] = useState<boolean>(false)
  const [ hydrateAPY, setHydrateAPY ] = useState<boolean>(true)
  const [apyData, setApyData] = useState<RoiProps['apyData']>(undefined)

  const triggerHydrate = useCallback(() => {
    setHydrate( p => !p )
  }, [setHydrate])

  const triggerAPYHydrate = useCallback( () => {
    setHydrateAPY(p => !p)
  },[setHydrateAPY])

  const FormComponent = useCallback( p => <Card {...p} background="light" style={{ padding: 32, maxWidth: 360 }}/>, [] )

  const toggleStakeModal = useCallback( () => setOpenStakeModal(p => !p), [setOpenStakeModal] )

  const toggleRoi = useCallback(()=>setOpenRoi( p => !p ),[setOpenRoi])

  const [items, setItems] = useImmer({ balance : 0, approved: 0, userInfo: { stakedAmount: 0, claimedAmount: 0, compoundedAmount: 0 }, totalStaked: 0, totalPool: 0, pendingReward: 0 })
  const [coinInfo, setCoinInfo] = useState({ name: '', symbol: '', decimals: 18 })

  const isApproved = useMemo( () => items.approved > 0 , [items])

  useEffect(() => {
    if(!hydrateAPY) return
    fetch('/api/getAPY',{
      method: 'POST',
      body: JSON.stringify({
        chainId: chainId || 56
      })
    })
    .then( response => response.json() )
    .then( data => setApyData(data) )
    .finally( () => hydrateAPY && triggerAPYHydrate() )
  },[chainId, hydrateAPY, setApyData, triggerAPYHydrate])
  
  const buttonAction = () =>{
    if(isApproved) 
      setOpenStakeModal( p => !p )
    else{
      coinMethods.approve( contractAddress, new BigNumber(30000000000000000000000000).toFixed() ).send({ from: account, gasPrice: parseInt(`${new BigNumber(10).pow(10)}`) })
        .on('transactionHash', (tx:string) => {
          console.log('hash', tx )
          editTransactions(tx,'pending', { description: `Approve CRUSH spend`})
        })
        .on('receipt', ( rc:Receipt) => {
          console.log('receipt',rc)
          triggerHydrate()
          editTransactions(rc.transactionHash,'complete')
        })
        .on('error', (error:any, receipt:Receipt) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        })
    }
  }

  const { action: cardPreStake } = useWithWallet({ action: buttonAction })

  const harvest = () => {
    mainMethods?.claim().send({ from: account })
      .on('transactionHash', (tx:string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: 'Harvest Rewards'})
      })
      .on('receipt', ( rc:Receipt) => {
        console.log('receipt',rc)
        triggerHydrate()
        editTransactions(rc.transactionHash,'complete')
      })
      .on('error', (error:any, receipt:Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error',{ errorData: error })
      })
  }
  const manualCompound = () => {
    mainMethods?.singleCompound().send({ from: account })
      .on('transactionHash', (tx:string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: "Compound My Assets" })
      })
      .on('receipt', ( rc:Receipt) => {
        console.log('receipt',rc)
        triggerHydrate()
        editTransactions(rc.transactionHash,'complete')
      })
      .on('error', (error:any, receipt:Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', { errorData: error} )
      })
  }

  useEffect(()=>{
    if(!coinMethods) return
    const getCoinData = async () => {
      const tokenName = await coinMethods.name().call()
      const tokenSymbol = await coinMethods.symbol().call()
      const tokenDecimals = await coinMethods.decimals().call()
      setCoinInfo({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals
      })
    }
    getCoinData()
  },[coinMethods])
// Hydrate changing Data
  useEffect( ()=>{
    const getPoolData = async () => {
      if(!coinContract || !account || !chainId || [56,97].indexOf(chainId) == -1 ) {
        setItems( draft => {
          draft.balance = 0
          draft.approved = 0
          draft.userInfo.stakedAmount = 0
          draft.userInfo.claimedAmount = 0
          draft.totalPool = 0
          draft.totalStaked = 1
          draft.pendingReward = 0
        })
        return
      }
      const availTokens = await coinMethods.balanceOf(account).call()
      const approved = await coinMethods.allowance(account, contractAddress).call()
      const userInfo = await mainMethods?.stakings(account).call()
      const totalPool = await mainMethods?.totalPool().call()
      const totalStaked = await mainMethods?.totalStaked().call()
      const pending = await mainMethods?.pendingReward(account).call().catch( (err:any) => {console.log('error', err); return 0})
      setItems( draft => {
        draft.balance = availTokens
        draft.approved = approved
        draft.userInfo.stakedAmount = +userInfo.stakedAmount
        draft.userInfo.claimedAmount = +userInfo.claimedAmount
        draft.totalPool = totalPool
        draft.totalStaked = totalStaked
        draft.pendingReward = pending
      })
    }
    getPoolData()
  },[coinContract, account, coinMethods, mainMethods, setItems, chainId, hydrate, contractAddress])

  useEffect(() => {
    const hydrateInterval = setInterval(triggerHydrate,5000)
    return () => clearInterval(hydrateInterval)
  },[ setHydrate, triggerHydrate ])
  
  const userStaked = new BigNumber(items.userInfo.stakedAmount).toNumber()
  const userProfit = new BigNumber(items.userInfo.claimedAmount).plus(items.pendingReward).toNumber()
  const pendingRewards = new BigNumber(items.pendingReward).toNumber()
  const stakedPercent = new BigNumber(userStaked).div( new BigNumber(items.totalStaked) ).times( new BigNumber(100) ).toNumber() //missing total staked amount

  const maxBalance = new BigNumber(items.balance).div( new BigNumber(10).pow(18) )
  const maxStaked = new BigNumber(userStaked).div( new BigNumber(10).pow(18) )
  const css = useStyles({})

  const shownInfo = useCallback( ( amount: number, decimals?: number ) => {
    if(!account)
      return "--.--"
    return currencyFormat(amount, { decimalsToShow: decimals, isWei: true })
  },[account])
  
  const InvaderThumb = useCallback( (allProps: {thumbProps: any, percent: BigNumber}) => {
    const isMax = allProps.percent.toNumber() === 100
    return(
      <SliderThumb {...allProps.thumbProps}>
        {allProps.thumbProps.children}
        <div style={{position: 'relative'}}>
          <InvaderIcon color="secondary" style={{position: 'absolute',left: -12, bottom: -10}}/>
          <Typography style={{ marginTop: 24, position:'absolute',left: isMax ? -12 : -15, bottom: -30 }} color="textPrimary" variant="caption">
            { isMax ? 'MAX' : `${allProps.percent.toFixed(2)}%`}
          </Typography>
        </div>
      </SliderThumb>
  )},[])

  return <>
    <Card background="light" className={ css.card } >
      <CardHeader classes={{ action: css.headerAction }}
        title="Manual CRUSH Pool"
        titleTypographyProps={{ className: css.headerTitle }}
        subheader="Manual Compounding"
        subheaderTypographyProps={{ variant: 'body2' }}
        action={
          <Avatar className={css.avatar}>
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
              {currencyFormat(maxStaked.toFixed(18) || 0)}
            </Typography>
          </Grid>
          <Grid item>
            <Typography color="textSecondary" variant="body2" >
              Your stake&nbsp;{currencyFormat(stakedPercent || 0, { decimalsToShow: 6 }) }%
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
                  { apyData?.d365?.percent 
                    ? <Typography color="primary" variant="body2" className={ css.percent }>
                        {currencyFormat(apyData?.d365?.percent * 100, { decimalsToShow: 2 })}%
                      </Typography>
                    : <Skeleton className={css.percent} animation="wave" height={20} width={80} />
                  }
                </Grid>
                <Grid item style={{paddingRight: 4}}>
                  <CalculationIcon className={ css.aprAction }/>
                </Grid>
              </Grid>
            </ButtonBase>
            <IconButton size="small" color="primary" onClick={triggerAPYHydrate} disabled={!contractAddress}>
              { hydrateAPY ? <CircularProgress size="inherit"/>
                : <RefreshIcon fontSize="inherit"/>}
            </IconButton>
          </Grid>
        </Grid>
        <Grid container justifyContent="space-between" alignItems="flex-end" className={ css.earnings }>
          <Grid item>
            <Typography variant="body2" color="textSecondary">
              {coinInfo.symbol} EARNED
            </Typography>
            <Typography variant="h5" component="div" color="primary">
              {shownInfo(pendingRewards, 8)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              $&nbsp;{shownInfo(pendingRewards * tokenInfo.crushUsdPrice, 2)} USD
            </Typography>
          </Grid>
          <Grid item>
            {account && <Button color="secondary" size="small" style={{fontWeight: 400}} width="96px" onClick={harvest} disabled={ pendingRewards == 0 } solidDisabledText>
              Harvest
            </Button>}
          </Grid>
        </Grid>
        <Button width="100%" color="primary" onClick={cardPreStake} solidDisabledText
          disabled={ !contractAddress }
        >
          { account 
              ? isApproved ? `STAKE ${coinInfo.symbol}` : "Enable"
              : "Unlock Wallet"}
        </Button>
      </CardContent>
      <CardActions>
        <Grid container>
          <Grid item xs={12}>
            <Divider style={{marginBottom: 24}}/>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <SmallButton size="small" color="primary" style={{marginRight: 4}} onClick={manualCompound} hasIcon disabled={!contractAddress}>
              <RefreshIcon fontSize="inherit" color="primary" style={{marginRight: 4}}/>Manual
            </SmallButton>
            <Tooltip arrow
              title={
                <Typography className={ css.tooltip }>
                  {infoText || ""}
                </Typography>
              }
            >
              <InfoOutlinedIcon color="disabled" fontSize="small"/>
            </Tooltip>
          </Grid>
          {/* <Grid item xs={6} container alignItems="center" justifyContent="flex-end">
            <ButtonBase onClick={ () => setDetailOpen( p => !p )}>
              <Typography variant="body2" color="primary" className={ css.detailsActionText }>
                Details
              </Typography>
              <ArrowIcon fontSize="small" color={detailOpen ? "primary" : "disabled"} style={{ transform: `rotate(${ detailOpen ? "180deg" : "0deg"})`}}/>
            </ButtonBase>
          </Grid> */}
          {/* <Grid item xs={12}>
            <Collapse in={detailOpen}>
              <Grid container alignItems="flex-end" style={{marginTop: 24}}>
                <Grid item xs={12}>
                  <Typography variant="caption" style={{ whiteSpace: 'pre-line' }}>
                    0.5% unstaking fee if withdrawn within 72h.{'\n'}
                    Performance Fee 3%
                  </Typography>
                </Grid>
              </Grid>
            </Collapse>
          </Grid> */}
        </Grid>
      </CardActions>
    </Card>
    {/* 
        STAKING FORM
    */}
    <Dialog 
      PaperComponent={FormComponent}
      open={openStakeModal}
      onClose={ toggleStakeModal }
    >
      <Formik
        initialValues = {{
          stakeAmount: 0,
          actionType: items.totalPool !== 0
        }}
        onSubmit={ ( values, { setSubmitting } ) => {
          const { stakeAmount, actionType } = values
          const maxUsed = actionType ? maxStaked : maxBalance
          const isMax = new BigNumber( stakeAmount ).div( maxUsed ).isEqualTo( 1 )
          console.log(stakeAmount, maxUsed, actionType ? "withdraw" : "stake", isMax, new BigNumber( stakeAmount ).div( maxUsed ).toFixed(18,1))
          const weiAmount = toWei(`${new BigNumber(stakeAmount).toFixed(18,1)}`)
          if(actionType){
            ( isMax ? mainMethods?.leaveStakingCompletely() : mainMethods?.leaveStaking(weiAmount)).send({ from: account })
              .on('transactionHash', (tx:string) =>{
                editTransactions(tx,'pending', { description: `Withdraw CRUSH from pool`})
              })
              .on('receipt', (rc:Receipt) => {
                editTransactions(rc.transactionHash, 'complete')
                triggerHydrate()
                openStakeModal && toggleStakeModal()
                setSubmitting(false)
              })
              .on('error', (error:any, receipt:Receipt) => {
                receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
                triggerHydrate()
                openStakeModal && toggleStakeModal()
                setSubmitting(false)
              })
          }else mainMethods?.enterStaking(weiAmount).send({ from: account })
            .on('transactionHash', (tx:string) =>{
              editTransactions(tx,'pending', { description: "Stake Crush in pool"})
            })
            .on('receipt', (rc:Receipt) => {
              editTransactions(rc.transactionHash, 'complete')
              triggerHydrate()
              openStakeModal && toggleStakeModal()
              setSubmitting(false)
            })
            .on('error', (error:any, receipt:Receipt) => {
              receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
              triggerHydrate()
              openStakeModal && toggleStakeModal()
              setSubmitting(false)
            })
        }}
        validate ={ ( values ) => {
          let errors: any = {}
          if(!values.actionType && new BigNumber(values.stakeAmount).isGreaterThan( maxBalance ) )
            errors.stakeAmount = "Insufficient Funds"
          if(values.actionType && new BigNumber(values.stakeAmount).isGreaterThan( maxStaked ) )
            errors.stakeAmount = "Insufficient Funds"
          if(values.stakeAmount <= 0)
            errors.stakeAmount = "Invalid Input"
          
          return errors
        }}
        validateOnChange
      >
      { ({values, setFieldValue, isSubmitting}) =>{
        const { actionType, stakeAmount } = values
        const maxUsed = actionType ? maxStaked : maxBalance
        const percent = new BigNumber( stakeAmount ).div( maxUsed ).times(100)
        const sliderChange = (e: any, value: number | number[]) => {
          if(Array.isArray(value)) return
          const newValue = value === 100 ? maxUsed : new BigNumber(value).times( maxUsed ).div(100)
          setFieldValue('stakeAmount', newValue)
        }
        const toggleStakeAction = (stakeActionValue: boolean) => {
          setFieldValue('actionType', stakeActionValue )
          setFieldValue('stakeAmount', 0 )
        }
        return(<Form>
          <Grid container className={ css.stakeActionBtnContainer }>
            <Grid item>
              <MButton className={ css.stakeActionBtn } color={ !actionType ? "secondary" : "info"} onClick={() => toggleStakeAction(false)} disabled={ items.totalPool == 0}>
                STAKE
              </MButton>
            </Grid>
            <Grid item>
              <Divider orientation="vertical"/>
            </Grid>
            <Grid item>
              <MButton className={ css.stakeActionBtn } color={ actionType ? "secondary" : "info"} onClick={() => toggleStakeAction(true)} disabled={ userStaked <=0 }>
                WITHDRAW
              </MButton>
            </Grid>
          </Grid>
          <Typography variant="body2" color="textSecondary" component="div" align="right" className={ css.currentTokenText }>
            { actionType 
                ? `Staked ${coinInfo.symbol}: ${currencyFormat( userStaked || 0, { isWei: true })} `
                : `Wallet ${coinInfo.symbol}: ${currencyFormat(items?.balance || 0, { isWei: true })} `}
          </Typography>
          <Field
            type="number"
            fullWidth
            label={actionType ? 'Withdraw Amount' : `Stake Amount`}
            id="stakeAmount"
            name="stakeAmount"
            placeholder="0.00"
            variant="outlined"
            component={TextField}
            InputProps={{
              endAdornment: <MButton color="secondary" onClick={ () => setFieldValue('stakeAmount', maxUsed )}>
                MAX
              </MButton>,
              className: css.textField,
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select()
            }}
          />
          <div className={ css.sliderContainer }>
            <Slider
              value={ isNaN(percent.toNumber()) ? 0 : percent.toNumber() }
              onChange={sliderChange}
              step={ 10 }
              components={{
                Thumb: function NewThumb (p) { return <InvaderThumb thumbProps={p} percent={percent}/>} 
              }}
              // valueLabelDisplay="on"
            />
          </div>
          <Grid container justifyContent="space-evenly">
            <SmallButton color="primary" onClick={() => sliderChange(null,25)}>
              25%
            </SmallButton>
            <SmallButton color="primary" onClick={() => sliderChange(null,50)}>
              50%
            </SmallButton>
            <SmallButton color="primary" onClick={() => sliderChange(null,75)}>
              75%
            </SmallButton>
            <SmallButton color="primary" onClick={() => sliderChange(null,100)}>
              MAX
            </SmallButton>
          </Grid>
          <Button color="primary" type="submit" width="100%" className={ css.submitBtn } disabled={isSubmitting}>
            {actionType ? 'WITHDRAW' : 'STAKE'} {coinInfo.symbol}
          </Button>
        </Form>)
        }}
      </Formik>
    </Dialog>
    <RoiModal
      open={openRoi}
      onClose={toggleRoi}
      tokenSymbol={coinInfo.symbol}
      tokenLink={"https://dex.apeswap.finance/#/swap"}
      apyData={apyData}
    />
  </>
}

export default PoolCard

type PoolProps = {
  abi: any,
  contractAddress: string, // address
  tokenAddress : string //address
  tokenAbi?: any,
  infoText?: string
}

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