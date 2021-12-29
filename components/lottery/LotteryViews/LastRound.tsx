import format from 'date-fns/format'
// Material
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Libs 
import NumberInvader from 'components/lottery/NumberInvader'

type LastRoundProps = {
  winningTeamTicket: string;
  lastDate: number;
  currentRound: number;
  tickets: Array<{ ticket: string, claimed: boolean }>;
  selectTicket: (ticketNumber: string, claimed: boolean, roundNumber: number, instaClaim?:boolean ) => void;
}

const LastRound = (props: LastRoundProps) => {
  const { winningTeamTicket, lastDate, tickets, selectTicket, currentRound } = props
  const winningDigits = winningTeamTicket.split('')
    
  return (<>
  {/*Winning ticket stack*/}
    <Stack>
      <Typography variant="subtitle2" color="textPrimary">
          Last round date: { format( lastDate ? new Date(lastDate * 1000) : new Date(), 'yyyy-MMM-dd HHaa')}    
      </Typography>
      <Divider sx={{my: 2}}/>
    
      <Stack justifyContent="center" direction = "row" alignItems="center" >
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
      <Stack justifyContent="center" direction ="row">
        <Typography variant="subtitle2" sx={{pr: 1}}>
          Total Tickets = {tickets.length}
        </Typography>
      </Stack>
      <Divider sx={{my: 2}}/>
      
      <Stack sx={{ maxHeight: 180.08, overflowY: 'auto'}}>
        {tickets.map(( ticketObj, ticketIndex) => {
          const { ticket, claimed } = ticketObj
          const ticketDigits = ticket.split('')
          const digitsMatched = ticketDigits.reduce( (acc, value, index) => {
            if(value === winningDigits[index] && acc === index){
              return acc + 1
            }
            return acc
          },0)
                                    
          return <Stack direction="row" justifyContent="center" alignItems="center" key={`ticket-display-${ticketIndex}`}>
          
            <Stack>
              <Typography align="right" variant="h6" sx={{pr: 1}}>
                #{ticketIndex+1}
              </Typography>
              <Typography variant="subtitle2" sx={{pr: 1}}>
                Matched first:
              </Typography>
            </Stack>

            {/*Last round tickets stack*/}
            <Paper
                key={`tickets-last-round-${ticketIndex}`}
                sx={ theme => ({
                  backgroundColor: theme.palette.mode == "dark" ? "#0C0E22" : theme.palette.primary.dark,
                  borderRadius: 3,
                  px: 2,
                  py: 2,
                  m: 1,
                })}
              >
                <Stack justifyContent="center" direction="row">
                  <NumberInvader size="small" matched={ digitsMatched > 3 ? 2 : digitsMatched - 1 } twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
                  <NumberInvader size="small" matched={ digitsMatched > 5 ? 2 : digitsMatched - 3 } twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
                  <NumberInvader size="small" matched={ digitsMatched - 5 } twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
                </Stack>
              </Paper>
              <Stack>
                <Chip label="Details" color="primary" variant="outlined" sx={{my: 1}} onClick={() => selectTicket(ticket, claimed, currentRound)}/>
                <Chip label="Claim" color="secondary" variant="outlined" sx={{my: 1}} onClick={() => selectTicket(ticket, claimed, currentRound, true)}/>
              </Stack>
            </Stack>
          })}
      </Stack>     
    </Stack>
  </>)
  
}
export default LastRound