import format from 'date-fns/format'
import BigNumber from 'bignumber.js'
// Material
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// Bitcrush UI 
import Currency from 'components/basics/Currency'
import NumberInvader from 'components/lottery/NumberInvader'
import SmallButton from 'components/basics/SmallButton'
// data & utils
import { currencyFormat } from 'utils/text/text'
import { partnerTokens } from 'data/partnerTokens'
// Types
import { TicketInfo } from 'types/lottery'

type LastRoundProps = {
  winningTeamTicket: string;
  lastDate: number;
  currentRound: number;
  token?: string;
  tokenAmount?: BigNumber; 
  tickets: Array<TicketInfo>;
  globalTickets: number;
  selectTicket: (ticketNumber: string, claimed: boolean, roundNumber: number, instaClaim?:boolean ) => void;
  claimAll: (round: number) => void
}

const LastRound = (props: LastRoundProps) => {
  const { winningTeamTicket, lastDate, tickets, selectTicket, currentRound, token, 
    tokenAmount, globalTickets, claimAll } = props
  const winningDigits = (winningTeamTicket || 'XXXXXXX').split('')
  const numberOfWinners: number = 0    

  const unclaimedTickets = (tickets ||[]).filter( ticket => !ticket.claimed).length > 0
  
  return (<>

  {/*Winning team stack*/}
    <Stack>
      <Stack direction="row" alignItems="center">
        <Typography variant="body2" fontWeight={500} color="primary">
            LAST ROUND 
        </Typography>

        <ArrowForwardIcon color="primary" sx={{fontSize: 18, bottom: 1, position: 'relative', ml: 0.5, mr: 1.5}} />    
        
        <Typography variant="body2" color="textPrimary">
          { format( lastDate ? new Date(lastDate * 1000) : new Date(), 'yyyy-MMMM-dd HHaa')}    
        </Typography>
      </Stack>
      <Divider sx={{mt: 2}}/>
    
      <Stack justifyContent="space-between" alignItems="center"
          sx={{
            py: 2,
            backgroundColor: theme => theme.palette.mode === "dark" ? 'transparent' : 'rgb(23,24,54)'
          }}
        >
        <Stack direction="row" justifyContent="center">
          <Typography  align ="center" color="secondary">
              <strong><Currency value={globalTickets} decimals ={0}/></strong> 
          </Typography>
          &nbsp;
          <Typography color="primary">
            FLIGHTS LAST ROUND WORLDWIDE
          </Typography>
        </Stack>

        <Typography sx={{mt: 1, mb: 2, color: 'white'}} variant="h6" align="center" fontWeight={600}>
          Winning Team
        </Typography>
        <Stack direction="row">
          <NumberInvader size="large" twoDigits={[winningDigits[1], winningDigits[2]]}/>
          <NumberInvader size="large" twoDigits={[winningDigits[3], winningDigits[4]]}/>
          <NumberInvader size="large" twoDigits={[winningDigits[5], winningDigits[6]]}/>
        </Stack>
      </Stack>
      <Divider sx={{mb: 2}}/>

      {/*Player stats*/}
      <Stack justifyContent={{ xs: 'center' ,md:"space-evenly"}} direction={{ md: "row", xs:'column'}} alignItems="center" sx={{mb: 1}}>
        <Typography align="left" variant="subtitle2" whiteSpace="pre-line">
        { new BigNumber(tokenAmount || 0).isGreaterThan(0) 
            ?
              <>
                <Typography color="textSecondary" variant="body2">
                  PARTNER BONUS:{'\n'}
                </Typography>
                <Typography  display="inline" color="secondary">
                  {currencyFormat(new BigNumber(tokenAmount || 0).toString(),{ decimalsToShow: 2, isWei: true})}
                </Typography>
                &nbsp;
                {token && partnerTokens[token]?.name || 'Pending'}
              </>
              : null
        }
        </Typography>
        <Typography align="center" variant="h6" sx={{ my: 2}}>
          Your Squadrons  
        </Typography>
        <Stack>
          <Typography variant="subtitle2" >
            {numberOfWinners} Successful Flights
          </Typography>
          <SmallButton color="secondary" hasIcon={true} onClick={() => claimAll(currentRound)} disabled={!unclaimedTickets}>
            { unclaimedTickets ? "CLAIM ALL" : "ALL CLAIMED"}
          </SmallButton>
        </Stack>
        
      </Stack>
 
      <Stack sx={{ maxHeight: 196, overflowY: 'auto'}}>
        
        <Divider sx={{my: 1}}/>

        {tickets.map(( ticketObj, ticketIndex) => {
          const { ticketNumber: ticket, claimed } = ticketObj
          const ticketDigits = ticket.split('')
          const digitsMatched = ticketDigits.reduce( (acc, value, index) => {
            if(value === winningDigits[index] && acc === index){
              return acc + 1
            }
            return acc
          },0)
          const totalDigitsMatched: number = 0

          {/*Ticket stack*/}
          return <Stack sx={{my: 1.5}} key={`last-round-ticket-${ticketIndex}`}>

            <Stack justifyContent="left" direction="row" sx={{mb: 3}}>
              <Typography variant="subtitle2" sx={{pr: 1}}>
                FLIGHT: 
              </Typography>
              <Typography color="primary" variant="subtitle2" sx={{pr: 1}}>
                {ticketIndex+1} 
              </Typography>
              <Typography variant="subtitle2" sx={{pr: 1}}>
                of
              </Typography>
              <Typography color="primary" variant="subtitle2" sx={{pr: 1}}>
              {tickets.length}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="center" alignItems="center" key={`ticket-display-${ticketIndex}`}>
            
              <Stack>
                <Typography variant="subtitle2" sx={{pr: 1}}>
                  Matched first: {totalDigitsMatched}
                </Typography>
              </Stack>

              {/*Paper with numberInvaders*/}
                  <Stack justifyContent="center" direction="row">
                    <NumberInvader size="large" matched={ digitsMatched > 3 ? 2 : digitsMatched - 1 } twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
                    <NumberInvader size="large" matched={ digitsMatched > 5 ? 2 : digitsMatched - 3 } twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
                    <NumberInvader size="large" matched={ digitsMatched - 5 } twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
                  </Stack>
                <Stack>
                  <Chip label="Details" color="primary" variant="outlined" sx={{my: 1}} onClick={() => selectTicket(ticket, claimed, currentRound)}/>
                  <Chip label={claimed ? "Claimed!" : "Claim"} disabled={claimed} color="secondary" variant="outlined" sx={{my: 1}} onClick={() => selectTicket(ticket, claimed, currentRound, true)}/>
                </Stack>
            </Stack>
          </Stack>
          })}
      </Stack>     
    </Stack>
  </>)
  
}
export default LastRound