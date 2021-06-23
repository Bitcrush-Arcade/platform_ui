import { useState, useEffect, useCallback, useContext } from 'react'
import { useImmer } from 'use-immer'
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
import Button from 'components/basics/GeneralUseButton'
import RoiModal, { RoiProps } from 'components/pools/RoiModal'
import SmallButton from 'components/basics/SmallButton'
// Icons
import CalculationIcon from 'components/svg/CalculationIcon'
import InvaderIcon from 'components/svg/InvaderIcon'
// utils
import { currencyFormat } from 'utils/text/text'
import { useWithWallet } from 'hooks/unlockWithWallet'
import { useContract } from 'hooks/web3Hooks'
import { TransactionContext } from 'components/context/TransactionContext'
import BigNumber from 'bignumber.js'
import { fromWei, toWei } from 'web3-utils'

const PoolCard = (props: PoolProps) => {
  const { abi, tokenAddress, contractAddress, tokenAbi, infoText } = props
  // Web3
  const { account, chainId } = useWeb3React()
  const { contract: coinContract, methods: coinMethods } = useContract(tokenAbi, tokenAddress)
  const { contract: mainContract, methods: mainMethods } = useContract(abi, contractAddress)
  // Context
  const { editTransactions, tokenInfo } = useContext(TransactionContext)
  // State
  const [ detailOpen, setDetailOpen ] = useState<boolean>(false)
  const [ openStakeModal, setOpenStakeModal ] = useState<boolean>(false)
  const [ openRoi, setOpenRoi ] = useState<boolean>(false)
  const [ stakeAction, setStakeAction ] = useState<boolean>(false)
  const [ hydrate, setHydrate ] = useState<boolean>(false)
  const [apyData, setApyData] = useState<RoiProps['apyData']>(undefined)

  const triggerHydrate = useCallback(() => {
    setHydrate( p => !p )
  }, [setHydrate])

  const FormComponent = useCallback( p => <Card {...p} background="light" style={{ padding: 32, maxWidth: 360 }}/>, [] )

  const toggleStakeModal = useCallback( () => setOpenStakeModal(p => !p), [setOpenStakeModal] )

  const toggleRoi = useCallback(()=>setOpenRoi( p => !p ),[setOpenRoi])

  const [items, setItems] = useImmer({ balance : 0, approved: 0, userInfo: { stakedAmount: 0, claimedAmount: 0, compoundedAmount: 0 }, totalStaked: 0, totalPool: 0, pendingReward: 0 })
  const [coinInfo, setCoinInfo] = useState({ name: '', symbol: '', decimals: 18 })

  const isApproved = items.approved > 0

  useEffect(() => {
    if(!chainId) return
    fetch('/api/getAPY',{
      method: 'POST',
      body: JSON.stringify({
        chainId: chainId
      })
    })
    .then( response => response.json() )
    .then( data => setApyData(data) )
  },[chainId])
  
  const buttonAction = () =>{
    if(isApproved) 
      setOpenStakeModal( p => !p )
    else{
      coinMethods.approve( contractAddress, new BigNumber(items.balance).toFixed() ).send({ from: account, gasPrice: parseInt(`${new BigNumber(10).pow(10)}`) })
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
          receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        })
    }
  }

  const { action: cardPreStake } = useWithWallet({ action: buttonAction })

  const harvest = () => {
    mainMethods?.claim().send({ from: account })
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
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  }
  const manualCompound = () => {
    mainMethods?.singleCompound().send({ from: account })
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
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
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
      if(!coinContract || !account || [97].indexOf(chainId) == -1 ) return
      const availTokens = await coinMethods.balanceOf(account).call()
      const approved = await coinMethods.allowance(account, contractAddress).call()
      const userInfo = await mainMethods.stakings(account).call()
      const totalPool = await mainMethods.totalPool().call()
      const totalStaked = await mainMethods.totalStaked().call()
      const pending = await mainMethods.pendingReward(account).call().catch( err => {console.log('error', err); return 0})
      console.log('pending',pending)
      setItems( draft => {
        draft.balance = availTokens
        draft.approved = approved
        draft.userInfo.stakedAmount = +userInfo.stakedAmount
        draft.userInfo.claimedAmount = +userInfo.claimedAmount
        draft.userInfo.compoundedAmount = +userInfo.compoundedAmount
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
  
  const userStaked = (items.userInfo.stakedAmount + items.userInfo.compoundedAmount) || 0
  const userProfit = (items.userInfo.claimedAmount + items.userInfo.compoundedAmount) || 0
  const profitAmount = +fromWei(`${userProfit}`)
  const stakedPercent = new BigNumber(userStaked).div( new BigNumber(items.totalStaked) ).times( new BigNumber(100) ).toNumber() //missing total staked amount

  const maxBalance = +fromWei(`${items.balance}`)
  const maxStaked = +fromWei(`${userStaked}`)
  const css = useStyles({})

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
              {currencyFormat(maxStaked || 0)}
            </Typography>
          </Grid>
          <Grid item>
            <Typography color="textSecondary" variant="body2" >
              Your stake&nbsp;{currencyFormat(stakedPercent || 0) }%
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
                    {apyData?.d365?.percent || '--%'}
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
                ? currencyFormat(profitAmount, { decimalsToShow: 8 })
                : "--.--"
              }
            </Typography>
            <Typography variant="body2" color="textSecondary">
              $&nbsp;{account ? currencyFormat( profitAmount * tokenInfo.crushUsdPrice , { decimalsToShow: 2 }) : "--.--"} USD
            </Typography>
          </Grid>
          <Grid item>
            {account && <Button color="secondary" size="small" style={{fontWeight: 400}} width="96px" onClick={harvest}>
              Harvest
            </Button>}
          </Grid>
        </Grid>
        <Button width="100%" color="primary" onClick={cardPreStake} 
          // disabled={items.totalPool == 0}
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
            <SmallButton size="small" color="primary" style={{marginRight: 8}} onClick={manualCompound}>
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
                    {currencyFormat(userProfit || 0)}
                  </Typography>
                  <Typography color="textSecondary" variant="caption">
                    USD {currencyFormat(userProfit || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" style={{ whiteSpace: 'pre-line' }}>
                    0.5% unstaking fee if withdrawn within 72h.{'\n'}
                    Performance Fee 3%
                  </Typography>
                </Grid>
              </Grid>
              {/* TESTING */}
              <Button onClick={ () => {
                mainMethods.addRewardToPool( new BigNumber(5000).times( new BigNumber(10).pow(18) ) ).send({ from: account })
                  .on('transactionHash', tx => editTransactions(tx, 'pending'))
                  .on('receipt', receipt => editTransactions(receipt.transactionHash, 'complete'))
                  .on('error', (error, receipt) => {
                    receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error')
                    console.log('error', error)
                  })
              }}>
                ADD REWARD TO POOL
              </Button>
              <Button onClick={ () => {
                coinMethods.approve( contractAddress, 0 ).send({ from: account })
                  .on('transactionHash', tx => editTransactions(tx, 'pending'))
                  .on('receipt', receipt => editTransactions(receipt.transactionHash, 'complete'))
                  .on('error', (error, receipt) => {
                    receipt?.transactionHash && editTransactions(receipt.transactionHash, 'error')
                    console.log('error', error)
                  })
              }}>
                DISPROVE CONTRACT
              </Button>
            </Collapse>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
    {/* 
        STAKING FORM
    */}
    <Dialog 
      PaperComponent={FormComponent}
      open={openStakeModal}
      onBackdropClick={ toggleStakeModal }
    >
      <Formik
        initialValues = {{
          stakeAmount: 0
        }}
        onSubmit={ ( values ) => {
          const weiAmount = new BigNumber( toWei(`${values.stakeAmount}`) )
          console.log('submit', weiAmount, stakeAction )
          if(stakeAction)
            return mainMethods.leaveStaking(weiAmount).send({ from: account })
              .on('transactionHash', tx =>{
                editTransactions(tx,'pending')
              })
              .on('receipt', rc => {
                editTransactions(rc.transactionHash, 'complete')
                triggerHydrate()
              })
              .on('error', (error, receipt) => {
                receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
                triggerHydrate()
              })
          return mainMethods.enterStaking(weiAmount).send({ from: account })
            .on('transactionHash', tx =>{
              editTransactions(tx,'pending')
            })
            .on('receipt', rc => {
              editTransactions(rc.transactionHash, 'complete')
              triggerHydrate()
            })
            .on('error', (error, receipt) => {
              receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
              triggerHydrate()
            })
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
              <MButton className={ css.stakeActionBtn } color={ stakeAction ? "secondary" : "default"} onClick={() => setStakeAction(true)} disabled={ userStaked <=0 }>
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
                ? `Staked ${coinInfo.symbol}: ${currencyFormat( userStaked || 0, { isGwei: true })} `
                : `Wallet ${coinInfo.symbol}: ${currencyFormat(items?.balance || 0, { isGwei: true })} `}
          </Typography>
          <Button color="primary" type="submit" width="100%" className={ css.submitBtn } disabled={isSubmitting}>
            {stakeAction ? 'WITHDRAW' : 'STAKE'} {coinInfo.symbol}
          </Button>
        </Form>
        }
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