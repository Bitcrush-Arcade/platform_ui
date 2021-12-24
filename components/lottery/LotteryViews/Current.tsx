// Material
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// Libs
import NumberInvader from 'components/lottery/NumberInvader'


{/* Current table props */}
type CurrentViewProps = {
  tickets: Array<string>;
}

{/* Current table props and formatting */}
const Current = (props: CurrentViewProps) => {
const { tickets } = props

return <>
  <Typography sx={{pl: 2, pb: 2}} variant="h6" align="center" fontWeight={600}>
    Your Tickets
  </Typography>
  {tickets.map( (ticketNumber, ticketIndex) => {
    const ticketDigits = ticketNumber.split('')
    
    console.log(ticketDigits)
    return <Stack style={{alignItems: "center"}} justifyContent = "center" direction ="row" key={`tickets-to-buy-${ticketIndex}`}>
      <Typography variant="h6" sx={{pr: 1}}>
        #{ticketIndex+1}
      </Typography>
      <Paper  
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
    </Stack>
  })}
</>
}
export default Current  