import { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import BigNumber from 'bignumber.js'
import random from 'lodash/random'
// Material
import { alpha } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useWeb3React } from '@web3-react/core'
// Icons
import CloseIcon from '@mui/icons-material/Close'
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

type TicketBuyModalProps ={
  open: boolean;
  onClose: () => void;
}

type LotteryInfo={
  currentRound: number,
  ticketPrice: BigNumber,
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
  const [ lotteryInfo, setLotteryInfo ] = useImmer<LotteryInfo|null>(null)
  // Ticket Info
  const [ tickets, setTickets ] = useImmer<Array<string>>([])
  // BlockChain
  const { account, chainId } = useWeb3React()
  const { tokenInfo } = useTransactionContext()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )

  useEffect( () => {
    if(!lotteryMethods) return
    const getLotteryData = async () => {
      const currentRound = new BigNumber(await lotteryMethods.currentRound().call()).toNumber();
      const ticketPrice = new BigNumber(await lotteryMethods.ticketValue().call());
      setLotteryInfo({
        currentRound,
        ticketPrice
      })
    }
    getLotteryData()
  },[lotteryMethods, setLotteryInfo])

  const balanceError = lotteryInfo?.ticketPrice.times(tickets.length).isGreaterThan(tokenInfo.weiBalance)
  const maxBuyError = (tickets.length) > 100

  const hasError = balanceError || maxBuyError

  const closeModal = () => {
    onClose()
    setTickets([])
    setStep(0)
  }

  const BuyStep = () => <>
    <Stack direction="row" justifyContent="space-between" px={3} mb={2}>
      <Typography color="textSecondary">
        Ticket Cost
      </Typography>
      <Typography color="primary">
        {currencyFormat( lotteryInfo?.ticketPrice.toString() || 0,{ isWei:true, decimalsToShow: 0 })}
        &nbsp;CRUSH
      </Typography>
    </Stack>
    <Stack direction="row" justifyContent="space-between" px={3}>
      <Typography variant="subtitle2" color="textSecondary">
        Round:
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {lotteryInfo?.currentRound}
      </Typography>
    </Stack>
    <TextField
      value={tickets.length}
      color="primary"
      onChange={ e => {
        const valueNumber = parseInt( e.target.value )
        if(isNaN(valueNumber))
          return
        setTickets( new Array(Math.abs(valueNumber)).fill(0).map( v => standardizeNumber(random(0,2000000, false)).toString() ) )
      }}
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*'
      }}
      InputProps={{
        endAdornment:<Typography variant="subtitle2" color="textSecondary" sx={{pl:2}}>
          {currencyFormat(tokenInfo.weiBalance.toString(), { isWei: true, decimalsToShow: 4})}
          &nbsp;CRUSH
        </Typography>,
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
        sx: theme => ({
          borderRadius: 32,
          pl: 1,
          backgroundColor: theme.palette.mode ==='dark' ? 'rgba(0,0,0,0.4)' : alpha(theme.palette.primary.light,0.4)
        })
      }}
      error={hasError}
      helperText={
        <Typography color="error" variant="caption" sx={{pt: 1, pb:1}} component="div">
          {balanceError ? 'Insufficient Balance ' :''}
          {maxBuyError ? "Can't buy more than 100 per transaction " : ''}
          &nbsp;
        </Typography>
      }
    />
    <Stack direction="row" justifyContent="space-between" px={3} mb={2}>
      <Typography>
        Total
      </Typography>
      <Typography color="primary">
        <Currency value={ lotteryInfo?.ticketPrice.times(tickets.length) || 0} decimals={0} isWei/>
        &nbsp;CRUSH
      </Typography>
    </Stack>
    <Stack spacing={2}>
      <Button color="primary" background="primary" onClick={()=>setStep(1)}
        disabled={hasError || tickets.length == 0}
      >
        Choose Tickets
      </Button>
      <Button color="secondary"
        disabled={hasError || tickets.length == 0}
      >
        Lucky Draw
      </Button>
      <Typography variant="subtitle2" px={2} whiteSpace="pre-line">
        "Choose Tickets" Shows you our draw selections and allows you to edit your invader team to customize your perfect team.{'\n'}
        "Lucky Draw" chooses your ticket numbers randomly with no duplicates on this draw.{'\n'}
        Purchases are final.
      </Typography>
    </Stack>
  </>

  return <Dialog 
    open={open}
    PaperComponent={FormComponent}
    PaperProps={{sx: {pt: 2}}}
  >
    <Stack direction="row" justifyContent="flex-end">
      <Tooltip arrow title={<Typography variant="subtitle1">Close Modal</Typography>}>
        <IconButton onClick={closeModal} size="small">
          <CloseIcon fontSize="inherit" color="error"/>
        </IconButton>
      </Tooltip>
    </Stack>
    <Typography variant="h5" align="center" fontWeight={600} sx={{ textTransform: 'uppercase', pb:3}}>
      { step === 0 && "Buy Tickets"}
      { step === 1 && `ROUND ${lotteryInfo?.currentRound}`}
    </Typography>
    { step === 0 && <BuyStep/>}
    {
      step === 1 && <>
      <Typography variant="subtitle1" align="center" fontWeight={600}>
        Your Tickets
      </Typography>
      {tickets.map( (ticketNumber, ticketIndex) => {
        const ticketDigits = getTicketDigits(parseInt(ticketNumber))

        return <Stack key={`tickets-to-buy-${ticketIndex}`}>
          <Typography variant="subtitle2" color="textSecondary">
            #{ticketIndex+1}
          </Typography>
          <Paper elevation={0}
            sx={ theme => ({
              backgroundColor: theme.palette.mode == "dark" ? "#0C0E22" : theme.palette.primary.dark,
              px: 2,
              py: 2,
            })}
          >

          </Paper>
        </Stack>
      })}
      </>
    }
  </Dialog>

}

export default TicketBuyModal