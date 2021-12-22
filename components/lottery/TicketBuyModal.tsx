import { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import BigNumber from 'bignumber.js'
// Material
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useWeb3React } from '@web3-react/core'
// Icons
import CloseIcon from '@mui/icons-material/Close'
// Bitcrush UI
import { FormComponent } from 'components/basics/StakeModal'
// Hooks
import { useContract } from 'hooks/web3Hooks'
import { useTransactionContext } from 'hooks/contextHooks'
// Data
import { getContracts } from 'data/contracts'
// Libs
import { currencyFormat } from 'utils/text/text'

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

  return <Dialog 
    open={open}
    PaperComponent={FormComponent}
    PaperProps={{sx: {pt: 2}}}
  >
    <Stack direction="row" justifyContent="flex-end">
      <Tooltip arrow title={<Typography variant="subtitle1">Close Modal</Typography>}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="inherit" color="error"/>
        </IconButton>
      </Tooltip>
    </Stack>
    <Typography variant="h5" align="center" fontWeight={600} sx={{ textTransform: 'uppercase', pb:3}}>
      Buy Tickets
    </Typography>
    <Stack direction="row" justifyContent="space-between" px={3}>
      <Typography variant="subtitle2" color="textSecondary">
        Buy:
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        Tickets Round {lotteryInfo?.currentRound}
      </Typography>
    </Stack>
    <TextField
      value={tickets.length}
      color="primary"
      onChange={ e => {
        const valueNumber = parseInt( e.target.value )
        if(isNaN(valueNumber))
          return
        setTickets( new Array(parseInt(e.target.value)).fill('000000') )
      }}
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*'
      }}
      InputProps={{
        endAdornment:<Typography variant="subtitle2" color="textSecondary" sx={{pl:2}}>
          {currencyFormat(tokenInfo.weiBalance.toString(), { isWei: true, decimalsToShow: 4})}
        </Typography>,
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
        sx:{
          borderRadius: 32,
          pl: 1,
          backgroundColor: 'rgba(0,0,0,0.4)'
        }
      }}

    />
    IM READY TO BUY TICKETS LFG!!!

  </Dialog>

}

export default TicketBuyModal