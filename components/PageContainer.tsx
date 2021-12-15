// React
import { useState, ReactNode, useEffect, useMemo } from 'react'
import { useImmer } from 'use-immer'
// 3p
import compact from 'lodash/compact'
// Material
import { Theme, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from "@mui/material/Typography"
// Components
import Footer from 'components/Footer'
import Header from 'components/HeaderBar'
import Menu from 'components/Menu'
import TxCard from 'components/context/TransactionCard'
import StakeModal, { StakeOptionsType, SubmitFunction } from "components/basics/StakeModal"
// Hooks
import { useEagerConnect } from 'hooks/web3Hooks'
// Utils
import { differenceFromNow } from 'utils/dateFormat'
import { toWei } from 'web3-utils'
import BigNumber from 'bignumber.js'
// Hooks
import useCoin from 'hooks/useCoin'
// Context
import { useTransactionContext } from 'hooks/contextHooks'
import { useWeb3React } from '@web3-react/core'
import { useContract } from 'hooks/web3Hooks'
import { getContracts } from 'data/contracts'
// Types
import type { Receipt } from 'types/PromiEvent'


const PageContainer = ( props: ContainerProps ) => {
  
  const { children, menuSm, background } = props
  
  const { chainId, account } = useWeb3React()
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const { isApproved, getApproved, approve } = useCoin()
  const [menuToggle, setMenuToggle] = useState<boolean>( menuSm ? false : !isSm )
  const [ activeTimelock, setActiveTimelock ] = useState<boolean>(false);
  const [hiddenPending, setHiddenPending] = useImmer<{ [hash: string] : 'pending' | 'success' | 'error' }>({})
  const [wfuCalled, setWfuCalled] = useState<{hash: string, amount: string} | null>(null) // amount is string for simplicity in passing values
  
  const css = useStyles({ menuToggle, ...props })

  const liveWallet = useMemo( () => getContracts('liveWallet', chainId), [chainId])
  const { methods: liveWalletMethods, web3 } = useContract( liveWallet.abi, liveWallet.address )

  const { pending, completed, lwModalStatus, toggleLwModal, tokenInfo, liveWallet: lwContext, hydrateToken, editTransactions } = useTransactionContext()

  const timelockInPlace = new Date().getTime()/1000 < lwContext.timelock

  useEagerConnect()

  useEffect( () => {
    getApproved( liveWallet.address )
  },[ liveWallet, getApproved ])

  useEffect( ()=>{
    if(!wfuCalled || !account || !web3?.eth || !hydrateToken ) return

    const interval = setInterval( () => {
      web3.eth.getTransactionReceipt( wfuCalled.hash, (e,rc) => {
        console.log( 'check Withdraw for User ', wfuCalled.hash, wfuCalled.amount)
        if(!rc) return
        if(rc.status){
          setWfuCalled(null)
          hydrateToken()
          fetch('/api/db/deposit',{ 
            method: 'POST',
            body: JSON.stringify({ 
              account: account,
              amount: wfuCalled.amount,
              negative: true,
            })
          })
            .then( r => r.json())
            .then( c => console.log('response',c))
            .catch(e => console.log(e))
        }
      } )
    }, 5000)

    return () => {
      clearInterval(interval)
    }

  },[wfuCalled, account, web3.eth, hydrateToken])

  const toggleMenu = () => setMenuToggle( p => !p )

  useEffect(()=>{
    if(menuSm) return
    setMenuToggle(!isSm)
  },[isSm, menuSm])

  const allHashes = compact( Object.keys(pending).map( hash => hiddenPending[hash] && pending[hash].status == hiddenPending[hash] ? null : pending[hash] ) )
  const shownPending = useMemo( () => {
    const filteredPending = {...pending}
    Object.keys(hiddenPending).map( hash => {
      if( filteredPending[hash]?.status == hiddenPending[hash] )
        delete filteredPending[hash]
    })
    return filteredPending
  },[pending, hiddenPending ])

  const withdrawDetails = () => {
    return timelockInPlace ? <>
          <Typography variant="caption" component="div" style={{ marginTop: 16, letterSpacing: 1.5}} align="justify" >
            0.5% early withdraw fee if withdrawn before { differenceFromNow(lwContext.timelock) }.
            <br/>
            {activeTimelock && <>
              {"Withdraws are disabled for 90 seconds after gameplay, please try again shortly."}
              </>
            }
          </Typography>
        </>
        : <></>
  }


    // LiveWallet Options
    const lwOptions: Array<StakeOptionsType> = [
      { 
        name: 'Add Funds',
        description: 'Add Funds to Live Wallet from CRUSH',
        btnText: 'Wallet CRUSH',
        maxValue: tokenInfo.weiBalance
      },
      { 
        name: 'Withdraw Funds',
        description: 'Withdraw funds from Live Wallet to CRUSH',
        btnText: 'Live Wallet CRUSH',
        maxValue: lwContext.balance,
        onSelectOption: () => hydrateToken(true),
        disableAction: timelockInPlace && activeTimelock,
        more: withdrawDetails
      },
    ]

    const stakeModalActionSelected = async ( action: number)=> {
      if(!timelockInPlace) return false
      const quickWithdrawLock = await fetch(`/api/db/play_timelock_active`,{
          method: "POST",
          body: JSON.stringify({
            account: account
          })
        })
        .then( r =>  r.json() )
        .then( d => {
          if(d.error)
            return true
          return d?.lockWithdraw || false
        })
        .catch( e => {
          return 'Error'
      })
      console.log({ quickWithdrawLock })
      if(typeof(quickWithdrawLock) == 'string') return true
      setActiveTimelock( p => quickWithdrawLock )

    }


    const lwSubmit: SubmitFunction = ( values, form ) => {
      if(!liveWalletMethods || !account) return form.setSubmitting(false)
      const weiValue = toWei(`${new BigNumber(values.stakeAmount).toFixed(18,1)}`)
      if(!values.actionType){
        return liveWalletMethods.addbet( weiValue )
          .send({ from: account })
          .on('transactionHash', (tx: string) => {
            console.log('hash', tx )
            editTransactions(tx,'pending', { description: `Add Funds to Live Wallet`})
            toggleLwModal()
          })
          .on('receipt', ( rc: Receipt ) => {
            console.log('receipt',rc)
            editTransactions(rc.transactionHash,'complete')
            fetch('/api/db/deposit',{ 
              method: 'POST',
              body: JSON.stringify({ 
                account: account,
                amount: values.stakeAmount.toString(),
                negative: false,
              })
            })
              .then( r => r.json())
              .then( c => console.log('response',c))
              .catch(e => console.log(e))
            hydrateToken()
          })
          .on('error', (error: any, receipt: Receipt) => {
            console.log('error', error, receipt)
            receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
            hydrateToken()
          })
      }
      else if(timelockInPlace){
        toggleLwModal()
        const signMessage = web3.utils.toHex("I agree to withdraw early from Livewallet "+values.stakeAmount+" and pay the early withdraw fee")
        return web3.eth.personal.sign( signMessage, account, "",
          (e,signature) => {
            if(e) return
            fetch('/api/withdrawForUser',{
              method: 'POST',
              body: JSON.stringify({
                chain: chainId,
                account: account,
                amount: weiValue,
              })
            })
            .then( response => response.json())
            .then( data => {
              // check if gameplay has happened in the past minute
              if( data.timelock ){
                editTransactions('withdrawError','pending', { comment: 'Withdrawals are delayed for 90 seconds after gameplay ends. Please try again shortly'});
                setTimeout(() => {
                  editTransactions('withdrawError', 'error',{ errorData: 'Withdrawals are delayed for 90 seconds after gameplay ends. Please try again shortly'})
                },3000)
                return
              }
              if(data.txHash) {
                editTransactions( data.txHash, 'pending', {  description: 'Withdraw for User from LiveWallet', needsReview: true});
                setWfuCalled({ hash: data.txHash, amount: values.stakeAmount.toString()})
              }
              else{
                editTransactions( 'Err........or..', 'pending', {errorData: data.error})
                setTimeout(
                  () => editTransactions('Err........or..', 'error', { errorData: data.error})
                  , 3000
                )
              }
            })
          }
          )
        
      }
      return liveWalletMethods.withdrawBet( weiValue )
        .send({ from: account })
        .on('transactionHash', (tx: string) => {
          console.log('hash', tx )
          editTransactions(tx,'pending', { description: `Withdraw Funds from LiveWallet`})
          toggleLwModal()
        })
        .on('receipt', ( rc: Receipt ) => {
          console.log('receipt',rc)
          editTransactions(rc.transactionHash,'complete')
          hydrateToken()
          fetch('/api/db/deposit',{ 
            method: 'POST',
            body: JSON.stringify({ 
              account: account,
              amount: values.stakeAmount.toString(),
              negative: true,
            })
          })
            .then( r => r.json())
            .then( c => console.log('response',c))
            .catch(e => console.log(e))
        })
        .on('error', (error: any, receipt: Receipt ) => {
          console.log('error', error, receipt)
          receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
          hydrateToken()
        })
    }

  return <div>
    <Box 
      sx={{
        transition: theme.transitions.create('background', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundImage: `url(${backgrounds[theme.palette.mode][background || 'default']})`,
        backgroundSize: 'cover',
        [theme.breakpoints.down('md')]:{
          backgroundSize: '200% auto',
          backgroundPosition: 'left calc(100% - 50% + 32px) top 0',
        },
        [theme.breakpoints.down(750)]:{
          backgroundSize: '400% auto',
          backgroundPosition: 'left calc(100% - 50% + 32px) top 0',
        },
        [theme.breakpoints.up('md')]:{
          backgroundPosition: (background || 'default') == 'default' ? 
            menuToggle ? `left calc( 50% + ${ theme.palette.mode =='dark' ? 74 : 120}px) top 0` : `left calc( 50% - ${ theme.palette.mode =='dark' ? 12 : 32}px ) top 0`
            : 'top',
        },
        [theme.breakpoints.up('xl')]:{
          backgroundSize: '120% auto',
        },
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        maxWidth: '100vw',
        position: 'relative',
        paddingBottom: theme.spacing(3)
      }}
    >
      <Header open={menuToggle} toggleOpen={toggleMenu}/>
      <Menu open={menuToggle} toggleOpen={toggleMenu} alwaysSm={menuSm}/>
      <Container maxWidth={false} className={css.contentContainer}>
        {children}
        {Object.keys(allHashes).length > 0 && <div style={{ position: 'fixed', top: 90, zIndex: 1, left: 'auto', right: '32px'}}>
          <TxCard hashes={shownPending} onClose={ hash => setHiddenPending( draft => { draft[hash] = pending[hash].status } )}/>
        </div>}
      </Container>
    </Box>
    <StakeModal
      open={lwModalStatus}
      onClose={toggleLwModal}
      options={lwOptions}
      onSubmit={lwSubmit}
      needsApprove={ !isApproved }
      onApprove={ () => approve(liveWallet.address) }
      coinInfo={{
        symbol: 'CRUSH',
        name: 'Crush Coin',
        decimals: 18
      }}
      onActionSelected={stakeModalActionSelected}
    />
    {/* <Footer/> */}
  </div>
}

export default PageContainer

type ContainerProps ={
  children?: ReactNode,
  fullPage?: boolean,
  background?: 'default' | 'galactic',
  menuSm?: boolean,
}

const useStyles = makeStyles<Theme, { menuToggle: boolean } & ContainerProps >( (theme: Theme) => createStyles({
  contentContainer:{
    paddingTop: 96,
    [theme.breakpoints.down('md')]:{
      paddingTop: 0,
    },
    paddingLeft: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.up('md')]:{
      paddingLeft: props => {
        if( props.menuSm )
          return theme.spacing(3)
        return props.menuToggle ? theme.spacing(33) : theme.spacing(12)
      },
    },
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  fullContainer:{
    
  },
}))

const backgrounds = {
  dark:{
    default: '/backgrounds/defaultBg.jpg',
    galactic:'/backgrounds/Galactic.jpg',
  },
  light:{
    default: '/backgrounds/light/palms.jpg',
    galactic:'/backgrounds/light/cosmic.jpg',
  }
}