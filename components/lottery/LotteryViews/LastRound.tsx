import format from 'date-fns/format'
// Material
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// Libs
import NumberInvader from 'components/lottery/NumberInvader'

type LastRoundProps = {
winningTeamTicket: string;
lastDate: number;
tickets: Array<{ ticket: string, claimed: boolean }>;
selectTicket?: (ticketNumber: string, claimed: boolean) => void;
}

const LastRound = (props: LastRoundProps) => {
  const { winningTeamTicket, lastDate, tickets } = props
  const winningDigits = winningTeamTicket.split('')
  
  //Winning ticket stack
  return (<>
    <Stack>
      <Typography variant="subtitle2" color="textPrimary">
          Last round date: { format( lastDate ? new Date(lastDate * 1000) : new Date(), 'yyyy-MMM-dd HHaa')}    
      </Typography>
      <Divider sx={{my: 2}}/>
    
    <Stack direction = "row" alignItems="center" >
      <Typography sx={{pl: 2, pb: 2}} variant="h6" align="center" fontWeight={600}>
        Winning Team
      </Typography>
      <Stack direction="row">
        <NumberInvader size="medium" twoDigits={[winningDigits[1], winningDigits[2]]}/>
        <NumberInvader size="medium" twoDigits={[winningDigits[3], winningDigits[4]]}/>
        <NumberInvader size="medium" twoDigits={[winningDigits[5], winningDigits[6]]}/>
      </Stack>
    </Stack>
    <Divider sx={{my: 2}}/>

    {tickets.map(( ticketObj, ticketIndex) => {
      const { ticket, claimed } = ticketObj
      const ticketDigits = ticket.split('')
      return <Paper  
          sx={ theme => ({
            backgroundColor: theme.palette.mode == "dark" ? "#0C0E22" : theme.palette.primary.dark,
            borderRadius: 3,
            px: 2,
            py: 2,
            m: 1,
            })}
        >
          <Stack direction="row">
            <NumberInvader size="small" twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
            <NumberInvader size="small" twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
            <NumberInvader size="small" twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
          </Stack>
        </Paper>
    })}
  </Stack>
  </>)
  
}
export default LastRound