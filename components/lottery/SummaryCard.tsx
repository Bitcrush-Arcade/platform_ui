// MaterialUi
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
// BitcrushUI
import Card from 'components/basics/Card'

const Summary = () => {
  return <Card>
    <div>
      <Typography>
        Tickets: THIS ROUND TICKETS
      </Typography>

      <Typography>
        next draw ->
      </Typography>
      <Typography>
        # CURRENT ROUND
      </Typography>
      <Typography>
        Date
      </Typography>
    </div>
    <CardContent>
      PRIZE

      USD AMOUNT 
      |
      TIME UNTIL 
      UNTIL ATTACK TIME
      BUY TICKETS CTA

      NEED COLLAPSE WITH EXTRA DATA
    </CardContent>
  </Card>
}

export default Summary