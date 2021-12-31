import format from 'date-fns/format'
// Material
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
// Libs
import NumberInvader from 'components/lottery/NumberInvader'


{/* Current table props */}
type CurrentViewProps = {
  tickets?: Array<string> | null;
  currentDate: number;
  roundId?: number | 0;
  totalTickets?: number;
}

{/* Current table props and formatting */}
const Current = (props: CurrentViewProps) => {
const { tickets, currentDate, roundId, totalTickets } = props

return <>

  <Stack direction="row" alignItems="center">
    <Typography variant="body2" fontWeight={500} color="secondary">
      NEXT DRAW
    </Typography>

    <ArrowForwardIcon color="secondary" sx={{fontSize: 18, bottom: 1, position: 'relative', ml: 0.5, mr: 1.5}} />    
    
    <Typography color="textSecondary" variant="body2" sx={{pr: 1}}>
      #{roundId} 
    </Typography>

    <Typography variant="body2" color="textPrimary">
      { format( currentDate ? new Date(currentDate * 1000) : new Date(), 'yyyy-MMMM-dd HHaa')}    
    </Typography>
  </Stack>
  <Divider sx={{mt: 2}}/>

  <Typography variant="h6" align="center" sx={{my: 2}} fontWeight={600}>
    Your Squadron
  </Typography>
  <Divider sx={{my: 1}}/>
  
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
                FLIGHT: &nbsp;
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
            
            {/* <Paper 
                sx={ theme => ({
                backgroundColor: theme.palette.mode == "dark" ? "#0C0E22" : theme.palette.primary.dark,
                borderRadius: 3,
                px: 1,
                py: 2,
                m: 1,
                alignSelf: "center",
                
                })}
                
            > */}
              <Stack direction="row" justifyContent="center" alignItems="center">
                <NumberInvader size="large" twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
                <NumberInvader size="large" twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
                <NumberInvader size="large" twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
              </Stack>
            {/* </Paper> */}
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