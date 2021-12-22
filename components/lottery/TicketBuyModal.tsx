// Material
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import { useWeb3React } from '@web3-react/core'
// Bitcrush UI
import { FormComponent } from 'components/basics/StakeModal'
// Hooks
import { useContract } from 'hooks/web3Hooks'
// Data
import { getContracts } from 'data/contracts'

type TicketBuyModalProps ={
  open: boolean;
  onClose: () => void;
}
const TicketBuyModal = (props: TicketBuyModalProps) => {

  const { open, onClose } = props;
  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )

  return <Dialog 
    open={open}
    PaperComponent={FormComponent}
    onClose={onClose}
  >
    <Typography variant="h5" align="center" fontWeight={600} sx={{ textTransform: 'uppercase', pb:3}}>
      Buy Tickets
    </Typography>
    IM READY TO BUY TICKETS LFG!!!

  </Dialog>

}

export default TicketBuyModal