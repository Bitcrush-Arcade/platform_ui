import { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import BigNumber from 'bignumber.js'
import random from 'lodash/random'
import { Formik, Field, Form } from 'formik'
import { TextField } from 'formik-mui'
// Material
import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import MButton from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useWeb3React } from '@web3-react/core'
// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
// Bitcrush UI
import Button from 'components/basics/GeneralUseButton'
import Currency from 'components/basics/Currency'
import { FormComponent } from 'components/basics/StakeModal'
// Hooks
import { useContract } from 'hooks/web3Hooks'
import { useTransactionContext } from 'hooks/contextHooks'
// Data
import { getContracts } from 'data/contracts'
// Libs
import { currencyFormat } from 'utils/text/text'
import { standardizeNumber, getTicketDigits } from 'utils/lottery'
import NumberInvader from 'components/lottery/NumberInvader'
import useCoin from 'hooks/useCoin'

type TicketBuyModalProps ={
  open: boolean;
  onClose: () => void;
}

type LotteryInfo={
  currentRound: number,
  ticketPrice: BigNumber,
  userBalance: BigNumber,
}

const TicketBuyModal = (props: TicketBuyModalProps) => {

  const { open, onClose } = props;
  // Steps are:
  // 0 -> buy tickets
  // 1 -> select Tickets
  // 2 -> edit Tickets
  // 3 -> Thanks page
  const [ step, setStep ] = useState<number>(0)
  // Lottery Info
  const [ lotteryInfo, setLotteryInfo ] = useImmer<LotteryInfo>({ currentRound: 0, ticketPrice: new BigNumber(0), userBalance: new BigNumber(0) })
  // Ticket Info
  const [ tickets, setTickets ] = useImmer<Array<string>>([])
  // Ticket Editor
  const [ selectedTicket, setSelectedTicket ] = useState<number>(0)
  // BlockChain
  const { account, chainId } = useWeb3React()
  const { approve, isApproved, coinMethods, getApproved} = useCoin()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )

  // Get Lottery Info
  useEffect( () => {
    if(!lotteryMethods) return
    const getLotteryData = async () => {
      const currentRound = new BigNumber(await lotteryMethods.currentRound().call()).toNumber();
      const ticketPrice = new BigNumber(await lotteryMethods.ticketValue().call());
      setLotteryInfo( draft => {
        draft.currentRound = currentRound
        draft.ticketPrice = ticketPrice
      })
    }
    getLotteryData()
  },[lotteryMethods, setLotteryInfo])
  // Get Lottery Approval
  useEffect(() => {
    if(!account || isApproved) return
    getApproved(lotteryContract.address)
  },[coinMethods, getApproved, lotteryContract.address, account, isApproved])

  useEffect( () => {
    if(step !== 0 || !account || !coinMethods) return
    const getData = async () => {
      const userBalance = new BigNumber( await coinMethods.balanceOf(account).call().catch( (e: any) => 0 ) )
      setLotteryInfo( draft => {
        draft.userBalance = userBalance
      })
    }
    getData()
  },[step, coinMethods, account, setLotteryInfo])

  const closeModal = () => {
    onClose()
    setTickets([])
    setStep(0)
  }
  return <Dialog 
    open={open}
    PaperComponent={FormComponent}
    PaperProps={{sx: {pt: 2, maxWidth: '360px'}}}
  >
    <Stack direction="row" justifyContent="space-between">
      <div>
        { step > 0 && 
          <Tooltip arrow title={<Typography variant="subtitle1">Back</Typography>}>
            <IconButton size="small" 
              onClick={()=>setStep( p => {
                if(step < 3) 
                  return p - 1
                else
                  return 1
              } )}
            >
              <ArrowBackIcon fontSize="inherit"/>
            </IconButton>
          </Tooltip>
        }
      </div>
      <Tooltip arrow title={<Typography variant="subtitle1">Close Modal</Typography>}>
        <IconButton onClick={closeModal} size="small">
          <CloseIcon fontSize="inherit" color="error"/>
        </IconButton>
      </Tooltip>
    </Stack>
    <Typography variant="h5" align="center" fontWeight={600} sx={{ textTransform: 'uppercase', pb:3}}>
      { step === 0 && "Buy Tickets"}
      { step === 1 && `ROUND ${lotteryInfo.currentRound}`}
      { step === 2 && `Edit Ticket ${selectedTicket + 1}`}
      { step === 3 && `Thanks for participating`}
    </Typography>
    { 
      step === 0 &&
        <>
          <Stack direction="row" justifyContent="space-between" px={3} mb={2}>
            <Typography color="textSecondary">
              Ticket Cost
            </Typography>
            <Typography color="primary">
              {currencyFormat( lotteryInfo.ticketPrice.toString() || 0,{ isWei:true, decimalsToShow: 0 })}
              &nbsp;CRUSH
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" px={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Round:
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {lotteryInfo.currentRound}
            </Typography>
          </Stack>
          <Formik
            initialValues={{ ticketAmount: '', instant: false }}
            onSubmit={(values) => {
              console.log(values)
              const ticketArray = new Array( parseInt(values.ticketAmount)).fill('0000000')
              if(values.instant)
                setTickets( ticketArray.map( x => standardizeNumber( random(0,999999) ).toString() ))
              else
                setTickets( ticketArray)
              setStep(1)
            }}
          >
            { ({ values, setFieldValue, submitForm }) => {
              const balanceError = lotteryInfo.ticketPrice.times(values.ticketAmount).isGreaterThan(lotteryInfo.userBalance)
              const maxBuyError = parseInt(values.ticketAmount) > 100
              const hasError = balanceError || maxBuyError
              return <Form>
                <Field name="ticketAmount"
                  component={TextField}
                  color="primary"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  fullWidth
                  InputProps={{
                    endAdornment: 
                      <MButton onClick={()=>setFieldValue('ticketAmount',100)} color="secondary" sx={{fontWeight: 600}}>
                        Max
                      </MButton>,
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
                    sx: (theme:Theme ) => ({
                      borderRadius: 32,
                      pl: 1,
                      backgroundColor: theme.palette.mode ==='dark' ? 'rgba(0,0,0,0.4)' : alpha(theme.palette.primary.light,0.4)
                    })
                  }}
                  error={hasError}
                  helperText={hasError ? <>
                      {balanceError ? 'Insufficient Balance ' :''}
                      {maxBuyError ? "Can't buy more than 100 per transaction " : ''}
                  </> : " "}
                />
                <Stack direction="row" justifyContent="space-between" px={3}>
                  <Typography>
                    Balance
                  </Typography>
                  <Typography color="primary">
                    <Currency value={ lotteryInfo.userBalance } decimals={0} isWei/>
                    &nbsp;CRUSH
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" px={3} mb={2}>
                  <Typography>
                    Total
                  </Typography>
                  <Typography color="primary">
                    <Currency value={ lotteryInfo.ticketPrice.times(values.ticketAmount)} decimals={0} isWei/>
                    &nbsp;CRUSH
                  </Typography>
                </Stack>
                <Stack spacing={2}>
                  {
                    isApproved ? <>
                      <Button color="primary" background="primary" onClick={submitForm}
                        disabled={hasError || isNaN(parseInt(values.ticketAmount)) || parseInt(values.ticketAmount) == 0}
                      >
                        Choose Tickets
                      </Button>
                      <Button color="secondary"
                        disabled={hasError || isNaN(parseInt(values.ticketAmount)) || parseInt(values.ticketAmount) == 0}
                        onClick={() => {
                          setFieldValue('instant', true)
                          submitForm()
                        }}
                      >
                        Lucky Draw
                      </Button>
                    </>
                    : <Button onClick={() => approve(lotteryContract.address)}>
                        Approve CRUSH
                      </Button>
                  }
                  <Typography variant="subtitle2" px={2} whiteSpace="pre-line">
                    &quot;Choose Tickets&quot; Shows you our draw selections and allows you to edit your invader team to customize your perfect team.{'\n'}
                    &quot;Lucky Draw&quot; chooses your ticket numbers randomly with no duplicates on this draw.{'\n'}
                    Purchases are final.
                  </Typography>
                </Stack>
              </Form>
            }}
          </Formik>
        </>
    }
    {
      step === 1 && 
      <>
        <Typography variant="subtitle1" align="center" fontWeight={600}>
          Your Tickets
        </Typography>
        {tickets.map( (ticketNumber, ticketIndex) => {
          const ticketDigits = ticketNumber.split('')
          const selectTicket = () => {
            setSelectedTicket(ticketIndex)
            setStep(2)
          }
          return <Stack key={`tickets-to-buy-${ticketIndex}`}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="textSecondary">
                #{ticketIndex+1}
              </Typography>
              <IconButton size="small" 
                onClick={selectTicket}
                sx={theme => ({ color: theme.palette.blue?.main })}
              >
                <EditIcon fontSize="inherit"/>
              </IconButton>
            </Stack>
            <Paper
              sx={ theme => ({
                backgroundColor: theme.palette.mode == "dark" ? "#0C0E22" : alpha(theme.palette.primary.dark,0.2),
                borderRadius: 3,
                px: 2,
                py: 2,
              })}
            >
              <Stack direction="row">
                <NumberInvader twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
                <NumberInvader twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
                <NumberInvader twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
              </Stack>
            </Paper>
          </Stack>
        })}
        <Button color="secondary" onClick={() => setStep(3)} sx={{ mt: 2}}>
          Get Tickets
        </Button>
      </>
    }
    {
      step == 2 && 
      <>
      </>
    }
    {
      step == 3 && 
      <>
      Thanks
      </>
    }
  </Dialog>

}

export default TicketBuyModal