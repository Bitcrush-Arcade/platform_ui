// Material
import Grid from '@mui/material/Grid'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
// BitcrushUI
import Card from 'components/basics/Card'

type TicketSelectCardProps={
  selected?: { ticket: string, claimed: boolean} | null
}

const TicketSelectCard = () => {

  return <>
    <Grid container justifyContent="center" alignItems="flex-end">
      <Grid item sx={{pl:1.5, pb: 1}}>
        {/*Tab changer*/}
        <Tabs value={0} indicatorColor="secondary" textColor="inherit">
          <Tab label={<Typography variant="body1">Last Winner</Typography>}/>
          <Tab label={<Typography variant="body1">Selected Ticket</Typography>}/>
        </Tabs>
      </Grid>
    </Grid>
    <Card>
      Winnings Card
    </Card>
  </>
}

export default TicketSelectCard