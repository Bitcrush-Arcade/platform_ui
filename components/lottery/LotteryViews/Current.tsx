import format from 'date-fns/format'
// Material
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
// Libs
import NumberInvader from 'components/lottery/NumberInvader'

// Bitcrush UI
import Currency from 'components/basics/Currency'

{/* Current table props */}
type CurrentViewProps = {
  tickets?: Array<string> | null;
  currentDate: number;
  currentRound?: number | 0;
  totalTickets: number;
}

{/* Current table props and formatting */}
const Current = (props: CurrentViewProps) => {
const { tickets, currentDate, currentRound, totalTickets} = props

return <>

  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Stack direction="row">
    <Typography variant="body2" fontWeight={500} color="secondary">
      NEXT DRAW
    </Typography>

    <ArrowForwardIcon color="secondary" sx={{fontSize: 18, bottom: 0, position: 'relative', mx: 0.5}} />    
    
    <Typography color="textSecondary" variant="body2">
      #{currentRound}
      &nbsp;
      &nbsp; 
    </Typography> 

    <Typography variant="body2" color="textPrimary">
      { format( currentDate ? new Date(currentDate * 1000) : new Date(), 'yyyy-MMM-dd HHaa')}    
    </Typography>
    </Stack>
    <Stack direction ="row">    
      <Typography color="secondary" component="div" variant="body2">
        <strong><Currency value={totalTickets} decimals={0}/></strong> 
        &nbsp;
      </Typography>
      <Typography color="primary" display="inline" variant="body2">
        SQUADS ATTACKING NOW
      </Typography>
    </Stack>
      
  </Stack>
  <Divider sx={{my: 2}}/>

    {
      tickets ? 
        <>
          <Typography variant="h6" align="center" sx={{mt: 1}} fontWeight={600}>
            Your Squadrons
          </Typography>
        </>
        :
        <>
          <Typography variant="h6" align="center" sx={{mt: 1}} fontWeight={600}>
            No Squadrons Recruited Yet
          </Typography>
        </>
    }

  <Divider sx={{my: 2}}/>
  
  <Stack sx={{ maxHeight: 353, overflowY: 'auto'}}>
  {
    tickets ? <>
      {tickets.map( (ticketNumber: string, ticketIndex: number) => {
          const ticketDigits = ticketNumber.split('')
          return <Stack
                   key={`tickets-to-buy-${ticketIndex}`} 
                   sx={{mt: 0.5, mb: 5,
                   
                    }}
                  >

            <Stack justifyContent="left" direction="row" sx={{mb: 3}}>
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
            </Stack>
              <Stack direction="row" justifyContent="center" alignItems="center">
                <NumberInvader size="large" twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
                <NumberInvader size="large" twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
                <NumberInvader size="large" twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
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
</>
}
export default Current  