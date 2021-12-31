import format from 'date-fns/format'
// Material
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
}

{/* Current table props and formatting */}
const Current = (props: CurrentViewProps) => {
const { tickets } = props

return <>

  <Typography variant="h6" align="center" sx={{pb: 1.5}} fontWeight={600}>
    Your Squadron
  </Typography>
  <Divider sx={{my: 1}}/>
  
  <Stack sx={{ maxHeight: 353, overflowY: 'auto'}}>
  {
    tickets ? <>
      {tickets.map( (ticketNumber: string, ticketIndex: number) => {
          const ticketDigits = ticketNumber.split('')
          return <Stack key={`tickets-to-buy-${ticketIndex}`} sx={{my: 1}}>
            <Stack justifyContent="left" direction="row">
              <Typography variant="subtitle2" sx={{pr: 1}}>
                TICKET: 
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
            
            <Paper 
                sx={ theme => ({
                backgroundColor: theme.palette.mode == "dark" ? "#0C0E22" : theme.palette.primary.dark,
                borderRadius: 3,
                px: 1,
                py: 2,
                m: 1,
                alignSelf: "center",
                
                })}
                
            >
              <Stack direction="row" justifyContent="center" alignItems="center">
                <NumberInvader size="large" twoDigits={[ticketDigits[1], ticketDigits[2]]}/>
                <NumberInvader size="large" twoDigits={[ticketDigits[3], ticketDigits[4]]}/>
                <NumberInvader size="large" twoDigits={[ticketDigits[5], ticketDigits[6]]}/>
              </Stack>
            </Paper>
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