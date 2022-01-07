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
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useWeb3React } from '@web3-react/core'
// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CircleIcon from '@mui/icons-material/Circle'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import EjectIcon from '@mui/icons-material/Eject'
import InvaderIcon, { invaderGradient } from 'components/svg/InvaderIcon'
// Bitcrush UI
import Button from 'components/basics/GeneralUseButton'
import Currency from 'components/basics/Currency'
import NumberInvader, { invaderList, invaderColor } from 'components/lottery/NumberInvader'
import { FormComponent } from 'components/basics/StakeModal'
// Hooks
import useCoin from 'hooks/useCoin'
import { useContract } from 'hooks/web3Hooks'
import { useTransactionContext } from 'hooks/contextHooks'
// Data
import { getContracts } from 'data/contracts'
// Libs
import { currencyFormat } from 'utils/text/text'
import { standardizeNumber, getTicketDigits } from 'utils/lottery'
import { Receipt } from 'types/PromiEvent'

type TicketBuyModalProps ={
  open: boolean;
  onClose: () => void;
  onReceipt: () => void;
}

type LotteryInfo={
  currentRound: number,
  ticketPrice: BigNumber,
  userBalance: BigNumber,
  txHash: string,
}


const TicketBuyModal = (props: TicketBuyModalProps) => {

  const { open, onClose, onReceipt } = props;
  const { editTransactions } = useTransactionContext()
  const [ gradient, gradientId ] = invaderGradient()
  // Steps are:
  // 0 -> buy tickets
  // 1 -> select Tickets
  // 2 -> edit Tickets
  // 3 -> Thanks page
  const [ step, setStep ] = useState<number>(0)
  // Lottery Info
  const [ lotteryInfo, setLotteryInfo ] = useImmer<LotteryInfo>({ currentRound: 0, ticketPrice: new BigNumber(0), userBalance: new BigNumber(0) , txHash: ''})
  // Ticket Info
  const [ tickets, setTickets ] = useImmer<Array<string>>([])
  // Ticket Editor
  const [ selectedTicket, setSelectedTicket ] = useState<number>(0)
  const [ ticketPair, setTicketPair ] = useState<number>(0)
  // BlockChain
  const { account, chainId } = useWeb3React()
  const { approve, isApproved, coinMethods, getApproved} = useCoin()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )

  const selectedNumber = step == 2 && tickets[selectedTicket].split('') || null
  const selectedPair = selectedNumber && selectedNumber.slice(ticketPair * 2 + 1, ticketPair * 2 + 3)
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
    if(!account || isApproved || !lotteryContract.address) return
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

  const buyTickets = () => {
    if(!lotteryMethods) return
    lotteryMethods.buyTickets(tickets,0)
      .send({ from: account })
      .on('transactionHash', (tx: string) => {
        console.log('hash', tx )
        setLotteryInfo( draft => { draft.txHash = tx })
        editTransactions(tx,'pending', { description: `Recruit ${tickets.length} invader teams`})
        setStep(3)
      })
      .on('receipt', ( rc: Receipt ) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        onReceipt()
      })
      .on('error', (error: any, receipt: Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
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
              onClick={()=>{
                setStep( p => step < 3 ? p - 1 : 1 )
                setTicketPair(0)
              }}
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
    <Typography variant="h5" align="center" color={ step === 3  ? "secondary" : "textPrimary"} fontWeight={600} sx={{ textTransform: 'uppercase', pb:3}}>
      { step === 0 && "Recruit Team"}
      { step === 1 && `ROUND ${lotteryInfo.currentRound}`}
      { step === 2 && `Edit Team ${selectedTicket + 1}`}
      { step === 3 && `Recruiting...`}
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
                        Pick Team
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
                    &quot;Pick Team&quot; Sets teams as default 000000, customize your teams to your taste.{'\n'}
                    &quot;Lucky Draw&quot; chooses your team members randomly with no duplicates on this draw.{'\n'}
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
          New Recruits
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
        <Button color="secondary" onClick={buyTickets} sx={{ mt: 2}}>
          Get Tickets
        </Button>
      </>
    }
    {
      step == 2 && 
      <>
        <Typography sx={{ mb: 2}}>
          Each invader is represented by two numbers, one being the invader type and the other the color. To edit, select the invader you want to edit and pick your favorite type or color.
        </Typography>
        <Paper
          sx={ theme => ({
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
            borderStyle: 'solid',
            backgroundColor: theme.palette.mode == "dark" ? "#0C0E22" : alpha(theme.palette.primary.dark,0.2),
            borderRadius: 3,
            px: 2,
          })}
        >
          { 
            selectedNumber && 
              <Stack direction="row" justifyContent="space-evenly">
                <ButtonBase onClick={() => setTicketPair(0)} sx={{ position: 'relative' ,py: 2}}>
                  <NumberInvader twoDigits={[selectedNumber[1], selectedNumber[2]]}/>
                  {ticketPair == 0 && <EjectIcon sx={{position: 'absolute', left: 'calc(50% - 20px)', bottom: -10, fontSize: 40, color: 'secondary.main'}}/>}
                </ButtonBase>
                <ButtonBase onClick={() => setTicketPair(1)} sx={{ position: 'relative' ,py: 2}}>
                  <NumberInvader twoDigits={[selectedNumber[3], selectedNumber[4]]}/>
                  {ticketPair == 1 && <EjectIcon sx={{position: 'absolute', left: 'calc(50% - 20px)', bottom: -10, fontSize: 40, color: 'secondary.main'}}/>}
                </ButtonBase>
                <ButtonBase onClick={() => setTicketPair(2)} sx={{ position: 'relative' ,py: 2}}>
                  <NumberInvader twoDigits={[selectedNumber[5], selectedNumber[6]]}/>
                  {ticketPair == 2 && <EjectIcon sx={{position: 'absolute', left: 'calc(50% - 20px)', bottom: -10, fontSize: 40, color: 'secondary.main'}}/>}
                </ButtonBase>
              </Stack>
          }
        </Paper>
        <Stack direction="row" justifyContent="space-evenly" mt={3}>
          {invaderList.map( (Invader, invaderIndex) => {
            const selectedInvader = selectedPair && invaderIndex === parseInt(selectedPair[0])
            const chooseInvader = () => {
              if(selectedInvader)
                return;
              setTickets( draft => {
                const ticketString = draft[selectedTicket].split('')
                ticketString[ticketPair*2 + 1] = `${invaderIndex}`
                draft[selectedTicket] = ticketString.join('')
              })
            }
            return <ButtonBase
              key={`invader-Type-selector-${invaderIndex}`}
              onClick={chooseInvader}
              sx={ theme => ({
                py: 1,
                px: 0.5,
                border: 1,
                borderColor: selectedInvader ? "primary.main" : 'transparent',
                borderRadius: 2,
                background: selectedInvader ? `linear-gradient( 180deg, transparent 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)` : 'none'
              })}
            >
              <Stack alignItems="center">
                <Invader sx={{ width: 20, height: 20 }} color={selectedInvader ? "primary" : "inherit"}/>
                <Typography color={selectedInvader ? "textPrimary" : "primary"}>
                  {invaderIndex}
                </Typography>
              </Stack>
            </ButtonBase>
          })}
        </Stack>
        <Stack direction="row" justifyContent="space-evenly" my={2}>
          {invaderList.map( (x, colorIndex) => {
            const selectedColor = selectedPair && colorIndex === parseInt(selectedPair[1])
            const chooseColor = () => {
              if(selectedColor)
                return;
              setTickets( draft => {
                const ticketString = draft[selectedTicket].split('')
                ticketString[(ticketPair + 1)*2] = `${colorIndex}`
                draft[selectedTicket] = ticketString.join('')
              })
              setTicketPair( p => p < 2 ? p + 1 : 0)
            }
            return <ButtonBase
              key={`invader-Color-selector-${colorIndex}`}
              onClick={chooseColor}
              sx={ theme => ({
                py: 1,
                px: 0.5,
                border: 1,
                borderColor: selectedColor ? "primary.main" : 'transparent',
                borderRadius: 2,
                background: selectedColor ? `linear-gradient( 180deg, transparent 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)` : 'none'
              })}
            >
              <Stack alignItems="center">
                <CircleIcon sx={{ width: 20, height: 20, color: invaderColor[`${colorIndex}`] }} />
                <Typography color={selectedColor ? "textPrimary" : "primary"}>
                  {colorIndex}
                </Typography>
              </Stack>
            </ButtonBase>
          })}
        </Stack>
        {
          (selectedTicket + 1) < tickets.length &&
            <Button color="secondary" size="small" sx={{ mb: 1}}
              onClick={() => {
                // setStep(1)
                setSelectedTicket( p => p+1)
                setTicketPair(0)
              }}
            >
              Edit Next Team
            </Button>
        }
        <Button color="primary" size="small"
          onClick={() => {
            setStep(1)
            setTicketPair(0)
          }}
        >
          Back to Teams
        </Button>
      </>
    }
    {
      step == 3 && 
      <Stack alignItems="center">
        <Typography align="center">
          Your transaction has been Submitted
        </Typography>
        <Typography align="center" color="secondary" component="a" target="_blank" href={`https://${chainId == 97 ? 'testnet.' : ''}bscscan.com/tx/${lotteryInfo.txHash}`} rel="noreferrer noopener">
            Check BSCscan
        </Typography>
        <div>
          { gradient }
          <InvaderIcon color="secondary"
            sx={{
              fill: `url(#${ gradientId })`,
              fontSize: 100,
            }}
          />
        </div>
        <Typography align="center" fontFamily="Zebulon" variant="h5"
          sx={theme => ({
            backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 10%, ${theme.palette.secondary.main} 70%)`,
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
          })}
        >
          CRUSH IT!
        </Typography>
        <Button color="primary" onClick={closeModal} sx={{mt: 2, width:  200}}>
          Close
        </Button>
      </Stack>
    }
  </Dialog>

}

export default TicketBuyModal