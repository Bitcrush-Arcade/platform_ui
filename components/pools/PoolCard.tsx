import { useState, useEffect, useCallback, useContext } from 'react'
// web3
import { useWeb3React } from '@web3-react/core'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Avatar from "@material-ui/core/Avatar"
import MButton from "@material-ui/core/Button"
import ButtonBase from "@material-ui/core/ButtonBase"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import Collapse from "@material-ui/core/Collapse"
import Dialog from '@material-ui/core/Dialog'
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
// import TextField from '@material-ui/core/TextField'
// Material Icons
import ArrowIcon from '@material-ui/icons/ArrowDropDownCircleOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import RefreshIcon from '@material-ui/icons/Refresh'
// Bitcrush
import Card from 'components/basics/Card'
import RoiModal from 'components/pools/RoiModal'
// Icons
import CalculationIcon from 'components/svg/CalculationIcon'
import InvaderIcon from 'components/svg/InvaderIcon'
// utils
import { currencyFormat } from 'utils/text/text'
import Button from 'components/basics/GeneralUseButton'
import SmallButton from 'components/basics/SmallButton'
import { useWithWallet } from 'hooks/unlockWithWallet'
import { useContract } from 'hooks/web3Hooks'
import { TransactionContext } from 'components/context/TransactionContext'
// CONTRACTS
import { useImmer } from 'use-immer'
import BigNumber from 'bignumber.js'
import { fromWei, toWei } from 'web3-utils'

const PoolCard = (props: PoolProps) => {
  const { abi, tokenAddress, contractAddress, tokenAbi, infoText } = props
  // Web3
  const { account, chainId } = useWeb3React()
  const { contract: coinContract, methods: coinMethods } = useContract(tokenAbi, tokenAddress)
  const { contract: mainContract, methods: mainMethods } = useContract(abi, contractAddress)
  // Context
  const { editTransactions } = useContext(TransactionContext)
  // State
  const [ detailOpen, setDetailOpen ] = useState<boolean>(false)
  const [ openStakeModal, setOpenStakeModal ] = useState<boolean>(false)
  const [ openRoi, setOpenRoi ] = useState<boolean>(false)
  const [ stakeAction, setStakeAction ] = useState<boolean>(false)
  const [ hydrate, setHydrate ] = useState<boolean>(false)

  const triggerHydrate = useCallback(() => {
    setHydrate( p => !p )
  }, [setHydrate])

  const toggleRoi = useCallback(()=>setOpenRoi( p => !p ),[setOpenRoi])

  const [items, setItems] = useImmer({ balance : 0, approved: 0, userInfo: null, staked: 0, stakePercent: 0, profit: 0 })
  const [coinInfo, setCoinInfo] = useState({ name: '', symbol: ''})

  const isApproved = items.approved > 0
  
  const buttonAction = () =>{
    if(isApproved) 
      setOpenStakeModal( p => !p )
    else{
      coinMethods.approve( contractAddress, new BigNumber(items.balance).times(new BigNumber(10).pow(18)) ).send({ from: account, gasPrice: new BigNumber(10).pow(10) })
        .on('transactionHash', (tx) => {
          console.log('hash', tx )
          editTransactions(tx,'pending')
        })
        .on('receipt', ( rc) => {
          console.log('receipt',rc)
          triggerHydrate()
          editTransactions(rc.transactionHash,'complete')
        })
        .on('error', (error, receipt) => {
          console.log('error', error, receipt)
          editTransactions(receipt.transactionHash, 'error', error)
        })
    }
  }

  const removeApproval = () => {
    coinMethods.decreaseAllowance( contractAddress, items.approved ).send({ from: account, gas: 60000, gasPrice: new BigNumber(10).pow(10) })
      .on('transactionHash', (tx) => {
        console.log('hash', tx )
        return tx
      })
      .on('receipt', ( rc) => {
        console.log('receipt',rc)
        triggerHydrate()
      })
  }

  const { action: cardPreStake } = useWithWallet({ action: buttonAction })

  useEffect(()=>{
    if(!coinMethods) return
    const getCoinData = async () => {
      const tokenName = await coinMethods.name().call()
      const tokenSymbol = await coinMethods.symbol().call()
      setCoinInfo({
        name: tokenName,
        symbol: tokenSymbol,
      })
    }
    getCoinData()
  },[coinMethods])
// Hydrate changing Data
  useEffect( ()=>{
    const getPoolData = async () => {
      if(!coinContract || !account || [97].indexOf(chainId) == -1 ) return
      const availTokens = await coinMethods.balanceOf(account).call()
      const approved = await coinMethods.allowance(account, contractAddress).call()
      const userInfo = await mainMethods.userInfo(0, account).call()
      setItems( draft => {
        draft.balance = availTokens
        draft.approved = approved
        draft.userInfo = userInfo
      })
    }
    getPoolData()
  },[coinContract, account, coinMethods, setItems, chainId, hydrate, contractAddress])

  const maxBalance = +fromWei(`${items.balance}`)
  const maxStaked = +fromWei(`${items.staked}`)
  const css = useStyles({})

  const amount = 0.00025423
  const apr = 1.5

  return <>
    <Card background="light" className={ css.card } >
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
              Staked
            </Typography>
          </Grid>
          <Grid item xs={12}/>
          <Grid item>
            <Typography color="primary" variant="body2" style={{fontWeight: 500}}>
              {currencyFormat(items.staked || 0)}
            </Typography>
          </Grid>
          <Grid item>
            <Typography color="textSecondary" variant="body2" >
              Your stake&nbsp;{currencyFormat((items.stakePercent || 0) * 100) }%
            </Typography>
          </Grid>
          <Grid item xs={12}/>
          <Grid item>
            <Typography color="textSecondary" variant="body2" >
              APR:
            </Typography>
          </Grid>
          <Grid item>
            <ButtonBase onClick={toggleRoi}>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <Typography color="primary" variant="body2" className={ css.percent }>
                    {apr * 100}%
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
              {coinInfo.symbol} EARNED
            </Typography>
            <Typography variant="h5" component="div" color="primary">
              {account 
                ? currencyFormat(amount, { decimalsToShow: 8 })
                : "--.--"
              }
            </Typography>
            <Typography variant="body2" color="textSecondary">
              $&nbsp;{account ? currencyFormat(amount, { decimalsToShow: 2 }) : "--.--"} USD
            </Typography>
          </Grid>
          <Grid item>
            {account && <Button color="secondary" size="small" style={{fontWeight: 400}} width="96px">
              Harvest
            </Button>}
          </Grid>
        </Grid>
        <Button width="100%" color="primary" onClick={cardPreStake}>
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
            <SmallButton size="small" color="primary" style={{marginRight: 8}}>
              <RefreshIcon fontSize="inherit" color="primary" style={{marginRight: 8}}/>Manual
            </SmallButton>
            <Tooltip arrow
              title={
                <Typography className={ css.tooltip }>
                  {infoText || "Any funds you stake in this pool will be automagically harvested and restaked (compounded) for you"}
                </Typography>
              }
            >
              <InfoOutlinedIcon color="disabled"/>
            </Tooltip>
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
              <Grid container alignItems="flex-end" style={{marginTop: 24}}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="primary" style={{ fontWeight: 600 }}>
                    {coinInfo.symbol} Profit Earned
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    {currencyFormat(items.profit || 0)}
                  </Typography>
                  <Typography color="textSecondary" variant="caption">
                    USD {currencyFormat(items.profit || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" style={{ whiteSpace: 'pre-line' }}>
                    0.5% unstaking fee if withdrawn within 72h.{'\n'}
                    Performance Fee 3%
                  </Typography>
                </Grid>
              </Grid>

            </Collapse>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
    {/* 
        STAKING FORM
    */}
    <Dialog 
      PaperComponent={p => <Card {...p} background="light" style={{ padding: 32, maxWidth: 360 }}/>}
      open={openStakeModal}
      onBackdropClick={ () => setOpenStakeModal(false) }
    >
      <Formik
        initialValues = {{
          stakeAmount: 0
        }}
        onSubmit={ ( values, { setSubmitting } ) => {
          const weiAmount = toWei(`${values.stakeAmount}`)
          console.log('submit', weiAmount, stakeAction )
          // This isn't ready yet
          // return mainMethods.enterStaking(weiAmount).send({ from: account })
          //   .on('transactionHash', tx =>{
          //     editTransactions(tx,'pending')
          //   })
          //   .on('receipt', rc => {
          //     editTransactions(rc.transactionHash, 'complete')

          //   })
          //   .on('error', (error, receipt) => {
          //     receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
          //   })
          setSubmitting(false)
        }}
        validate ={ ( values ) => {
          let errors: any = {}
          if(!stakeAction && values.stakeAmount > maxBalance )
            errors.stakeAmount = "Insufficient Funds"
          if(stakeAction && values.stakeAmount > maxStaked )
            errors.stakeAmount = "Insufficient Funds"
          if(values.stakeAmount <= 0)
            errors.stakeAmount = "Invalid Input"
          
          return errors
        }}
        validateOnChange
      >
      { ({setFieldValue, isSubmitting}) =>
        <Form>
          <Grid container spacing={1} className={ css.stakeActionBtnContainer }>
            <Grid item>
              <MButton className={ css.stakeActionBtn } color={ !stakeAction ? "secondary" : "default"} onClick={() => setStakeAction(false)}>
                STAKE
              </MButton>
            </Grid>
            <Grid item>
              <Divider orientation="vertical"/>
            </Grid>
            <Grid item>
              <MButton className={ css.stakeActionBtn } color={ stakeAction ? "secondary" : "default"} onClick={() => setStakeAction(true)} disabled={items.staked <=0 }>
                WITHDRAW
              </MButton>
            </Grid>
          </Grid>
          <Field
            type="number"
            fullWidth
            label={`${coinInfo.name} to stake`}
            id="stakeAmount"
            name="stakeAmount"
            placeholder="0.00"
            variant="outlined"
            component={TextField}
            InputProps={{
              endAdornment: <MButton color="secondary" onClick={ () => setFieldValue('stakeAmount', stakeAction ? maxStaked : maxBalance )}>
                MAX
              </MButton>,
              className: css.textField 
            }}
          />
          <Typography variant="body2" color="textSecondary" component="div" align="right" className={ css.currentTokenText }>
            { stakeAction 
                ? `Staked ${coinInfo.symbol}: ${currencyFormat(items?.staked || 0, { isGwei: true })} `
                : `Wallet ${coinInfo.symbol}: ${currencyFormat(items?.balance || 0, { isGwei: true })} `}
          </Typography>
          <Button color="primary" type="submit" width="100%" className={ css.submitBtn } disabled={isSubmitting}>
            {stakeAction ? 'WITHDRAW' : 'STAKE'} {coinInfo.symbol}
          </Button>
        </Form>
        }
      </Formik>
    </Dialog>
    <RoiModal open={openRoi} onClose={toggleRoi} tokenSymbol={coinInfo.symbol} tokenLink={"https://dex.apeswap.finance/#/swap"}/>
  </>
}

export default PoolCard

type PoolProps = {
  abi: any,
  contractAddress: string, // address
  tokenAddress ?: string //address
  tokenAbi?: any,
  infoText?: string
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
  },
  textField:{
    borderRadius: theme.spacing(4),
    paddingLeft: theme.spacing(3),
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
    marginBottom: theme.spacing(2),
  },
  currentTokenText:{
    marginTop: theme.spacing(1),
    paddingRight: theme.spacing(2)
  }
}))