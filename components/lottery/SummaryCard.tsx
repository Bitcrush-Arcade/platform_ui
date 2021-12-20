import { useState } from 'react'
// MaterialUi
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
// BitcrushUI
import Card from 'components/basics/Card'
import SmButton from 'components/basics/SmallButton'

const Summary = () => {
  const round = { tickets: 3 }
  const [ showDetail, setShowDetail ] = useState<boolean>(false)
  const toggleDetail = () => setShowDetail( p => !p )

  return <Card>
    {/* CARD HEADER */}
    <Grid container justifyContent="space-between" sx={{ px: 3, py:2 }}>
      <Grid item>
        <Typography color="textSecondary" variant="body2" component="div">
          Tickets:&nbsp;
          <Typography variant="body2" display="inline" color="textPrimary">
            You have&nbsp;
            <Typography color="primary" variant="body2" display="inline" fontWeight={500}>
              {round.tickets}
            </Typography>
            &nbsp;&nbsp;tickets this round
          </Typography>
        </Typography>
      </Grid>
      <Grid item>
        <Typography>
          next draw -&gt;
        </Typography>
        <Typography>
          # CURRENT ROUND
        </Typography>
        <Typography>
          Date
        </Typography>
      </Grid>
    </Grid>
    <CardContent>
      PRIZE

      USD AMOUNT 
      |
      TIME UNTIL 
      UNTIL ATTACK TIME
      BUY TICKETS CTA
      <Collapse in={showDetail}>
        NEED COLLAPSE WITH EXTRA DATA
      </Collapse>
    </CardContent>
      <SmButton color="secondary" onClick={toggleDetail}>
        Hide Button
      </SmButton>
  </Card>
}

export default Summary