import { useState, useEffect, useCallback, useContext } from 'react'
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
import Dialog from '@material-ui/core/Dialog'
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import TextField from '@material-ui/core/TextField'
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
import { useWithWallet } from 'hooks/unlockWithWallet'
import { useContract } from 'hooks/web3Hooks'
import { TransactionContext } from 'components/context/TransactionContext'
// CONTRACTS
import CrushCoin from 'abi/CrushToken.json'
import { useImmer } from 'use-immer'
import BigNumber from 'bignumber.js'

const PoolCard = (props: PoolProps) => {
  const { abi, tokenAddress, contractAddress, tokenAbi } = props
  // Web3
  const { account, chainId } = useWeb3React()
  const { contract: coinContract, methods: coinMethods } = useContract(CrushCoin.abi, "0xa3ca5df2938126bae7c0df74d3132b5f72bda0b6")
  const { contract: mainContract, methods: mainMethods } = useContract(abi, contractAddress)
  // Context
  const { editTransactions } = useContext(TransactionContext)
  // State
  const [ detailOpen, setDetailOpen ] = useState<boolean>(false)
  const [ openStakeModal, setOpenStakeModal ] = useState<boolean>(false)
  const [ hydrate, setHydrate ] = useState<boolean>(false)

  const triggerHydrate = useCallback(() => {
    setHydrate( p => !p )
  }, [setHydrate])

  const [items, setItems] = useImmer({ balance : 0, approved: 0 })
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

  const { action: stake } = useWithWallet({ action: buttonAction })


  useEffect( ()=>{
    const getPoolData = async () => {
      if(!coinContract || !account || [97].indexOf(chainId) == -1 ) return
      const availTokens = await coinMethods.balanceOf(account).call()
      const approved = await coinMethods.allowance(account, contractAddress).call()
      setItems( draft => {
        draft.balance = availTokens
        draft.approved = approved
      })
    }
    getPoolData()
  },[coinContract, account, coinMethods, setItems, chainId, hydrate])

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
              APR:
            </Typography>
          </Grid>
          <Grid item>
            <ButtonBase>
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
              CRUSH EARNED
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
        <Button width="100%" color="primary" onClick={stake}>
          { account 
              ? isApproved ? "STAKE" : "Enable"
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
              <Button onClick={removeApproval}>
                Remove Allowance
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
      PaperComponent={Card}
      PaperProps={{
        background: "light",
        style: { padding: 32 }
      }}
      open={openStakeModal}
      onBackdropClick={ () => setOpenStakeModal(false) }
    >
      Available Tokens {currencyFormat(items?.balance || 0, { isGwei: true })}
      <TextField
        type="number"
        fullWidth
        label="Tokens to Stake"
        placeholder="0.00"
        variant="outlined"
      />
      <Button color="primary" onClick={()=>console.log("Approve/stake")}>
        stake
      </Button>
    </Dialog>
  </>
}

export default PoolCard

type PoolProps = {
  abi: any,
  contractAddress: string, // address
  tokenAddress ?: string //address
  tokenAbi?: any,
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