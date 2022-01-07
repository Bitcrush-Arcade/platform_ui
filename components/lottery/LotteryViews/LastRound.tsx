import format from 'date-fns/format'
import BigNumber from 'bignumber.js'
import sortBy from 'lodash/sortBy'
// Material
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
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
  lastRound: string;
  token?: string;
  tokenAmount?: BigNumber; 
  tickets: Array<TicketInfo>;
  globalTickets: number;
  selectTicket: (ticketNumber: string, claimed: boolean, roundNumber: number, instaClaim?:boolean ) => void;
}

const LastRound = (props: LastRoundProps) => {
  const { winningTeamTicket, lastDate, tickets, selectTicket, lastRound, token, 
    tokenAmount, globalTickets } = props
  const winningDigits = (winningTeamTicket || 'XXXXXXX').split('')

  const sortedTickets = sortBy(
    (tickets ||[]).map( ticket => {
      const ticketDigits = ticket.ticketNumber.split('')
      const digitsMatched = ticketDigits.reduce( (acc, value, index) => {
        if(value === winningDigits[index] && acc === index){
          return acc + 1
        }
        return acc
      },0)
      return { matchedAmount: digitsMatched*(-1), ticketNumber: ticket.ticketNumber}
    })
    ,[ o => o.matchedAmount ])
  const totalUserRoundWinners = sortedTickets.filter( ticket => ticket.matchedAmount < -1).length

  return (<>

  {/*Winning team stack*/}
    <Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row">
          <Typography variant="body2" fontWeight={500} color="primary">
              LAST ROUND 
          </Typography>

          <ArrowForwardIcon color="primary" sx={{fontSize: 18, bottom: 0, position: 'relative', mx: 0.5}} />    
          
          <Typography color="textSecondary" variant="body2">
            #{lastRound}
            &nbsp; 
            &nbsp; 
          </Typography>
          <Typography variant="body2" color="textPrimary">
            { format( lastDate ? new Date(lastDate * 1000) : new Date(), 'yyyy-MMM-dd HHaa')}    
          </Typography>
        </Stack>

        <Stack direction ="row">    
          <Typography color="secondary" component="div" variant="body2">
            <strong><Currency value={globalTickets} decimals ={0}/></strong> 
            &nbsp;
          </Typography>
          <Typography color="primary" display="inline" variant="body2">
            SQUADS ATTACKED
          </Typography>
        </Stack>

      </Stack>
      
      <Divider sx={{mt: 2}}/>
    
      <Stack justifyContent="center" 
          sx={{
            py: 2,
            backgroundColor: theme => theme.palette.mode === "dark" ? 'transparent' : 'rgb(23,24,54)'
          }}
        >

        <Typography sx={{mb: 2, color: 'white'}} variant="h6" align="center" fontWeight={600}>
          Winning Team
        </Typography>
        <Stack direction="row" justifyContent="center">
                <NumberInvader size="large" matched={2} twoDigits={[winningDigits[1], winningDigits[2]]}/>
                <NumberInvader size="large" matched={2} twoDigits={[winningDigits[3], winningDigits[4]]}/>
                <NumberInvader size="large" matched={2} twoDigits={[winningDigits[5], winningDigits[6]]}/>
        </Stack>
      </Stack>
      <Divider sx={{mb: 2}}/>

      <Grid container alignItems="center" sx={{mb: 1}}>
        <Grid item xs={12} sm={4}>
          <Typography align="center" variant="subtitle2" whiteSpace="pre-line">
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
        </Grid>
        <Grid item xs={12} sm={4}>
          {
            tickets && tickets.length > 0 ? 
              <>
                <Typography variant="h6" align="center" fontWeight={600}>
                  Your Squadrons
                </Typography>
              </>
              :
              <>
                <Typography variant="h6" align="center" whiteSpace="pre-line" fontWeight={600}>
                  No Squadrons {'\n'} Recruited
                </Typography>
              </>
          }
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography align="center" variant="subtitle2" >
            {totalUserRoundWinners} Successful Attacks
          </Typography>
        </Grid>
      </Grid>
      <Divider sx={{mt: 1}}/>
      <Stack sx={{ maxHeight: 196, overflowY: 'auto'}}>
        {
        tickets ? <>
          {sortedTickets.map(( ticketObj, ticketIndex) => {
            const { ticketNumber: ticket, matchedAmount: baseMatched } = ticketObj
            const ticketDigits = ticket.split('')
            const matchedAmount = Math.abs(baseMatched)

            {/*Ticket stack*/}
            return <Stack sx={{mt: 1, mb: 1.5}} key={`last-round-ticket-${ticketIndex}`}>
              <Stack direction ="row" justifyContent="space-between" alignItems="center" mb={2} px={4}> 
                <Typography color="textSecondary" variant="body2">
                    SQUAD: &nbsp;
                  <Typography color="primary" variant="subtitle2" display="inline" component="span">
                      {ticketIndex+1} 
                  </Typography>
                  &nbsp;
                  <Typography  color="textPrimary" variant="body2" display="inline" component="span">
                    of
                  </Typography>
                  &nbsp;
                  <Typography color="primary" variant="subtitle2" display="inline" component="span">
                    {tickets.length}
                  </Typography>
                </Typography>
                <Chip label="Details" color="primary" variant="outlined" sx={{my: 1}} onClick={() => selectTicket(ticket, true, lastRound)}/>
              </Stack>

              {/*Paper with numberInvaders*/}
              <Stack justifyContent="center" direction="row">
                <NumberInvader size="large" matched={ matchedAmount > 3 ? 2 : matchedAmount - 1 } twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
                <NumberInvader size="large" matched={ matchedAmount > 5 ? 2 : matchedAmount - 3 } twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
                <NumberInvader size="large" matched={ matchedAmount - 5 } twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
              </Stack>
            </Stack>
            })}
            </>
            :
            <>
             <Typography variant="caption" component="div" sx={{ px: 2, width: 150 }}>
                <Skeleton />
              </Typography>
              <Typography variant="h6" component="div" sx={{ px: 2, }}>
                <Skeleton height={150} />
              </Typography>
              <Typography variant="caption" component="div" sx={{ px: 2, width: 150 }}>
                <Skeleton />
              </Typography>
              <Typography variant="h6" component="div" sx={{ px: 2, }}>
                <Skeleton height={150} />
              </Typography>
            </>
        }

      </Stack>     
    </Stack>
  </>)
  
}
export default LastRound