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
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
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
import NumberInvader from 'components/lottery/NumberInvader'


{/* History table props */}
type CurrentViewProps = {
 
}

{/* History table props and formatting */}
const Current = (props: CurrentViewProps) => {

{/*const [ tickets, setTickets ] = useImmer<Array<string>>([])*/}  

const [ tickets, setTickets ] = useImmer<Array<string>>(['1123456'])

return <>
  <Typography variant="subtitle1" align="center" fontWeight={600}>
    Your Tickets
  </Typography>
  {tickets.map( (ticketNumber, ticketIndex) => {
    const ticketDigits = ticketNumber.split('')
    
    console.log(ticketDigits)
    return <Stack style={{alignItems: "center"}} justifyContent = "center" direction ="row" key={`tickets-to-buy-${ticketIndex}`}>
      <Typography variant="subtitle1" sx={{pr: 1}}>
        #{ticketIndex+1}
      </Typography>
      <Paper
        sx={ theme => ({
          backgroundColor: theme.palette.mode == "dark" ? "#0C0E22" : theme.palette.primary.dark,
          borderRadius: 3,
          px: 2,
          py: 2,
        })}
      >
        <Stack direction="row">
          <NumberInvader size="small" twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
          <NumberInvader size="small" twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
          <NumberInvader size="small" twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
        </Stack>
      </Paper>
    </Stack>
  })}
</>
}
export default Current  