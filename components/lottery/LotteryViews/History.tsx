import useImmer from 'use-immer'
import format from 'date-fns/format'
//Material
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

{/* History table props */}
type HistoryViewProps = {
  rounds: Array<{
    id: number,
    date: Date,
    totalTickets: number,
    userTickets: number,
    tokenAmount: number,
    token: string,
  }>,
  totalRounds: number,
  currentPageView: number,
  onPagination: (newPage: number) => void,
  rowsPerPage:number,
  onRoundView: (roundId: number) => void,
}

{/* History table props and formatting */}
const History = (props: HistoryViewProps) => {
  const { rounds, totalRounds, currentPageView, onPagination, rowsPerPage, onRoundView } = props

  {/*Creating filler array to fill missing rows*/}
  const filler = new Array(rowsPerPage-rounds.length).fill({id: '', date: '-', totalTickets: '', userTickets: '', tokenAmount: '', token: ''})

  {/*History table rows data formatting*/}
  const tableRows = (rounds.concat(filler)).map( (roundInfo, index) => {
    return <TableRow key={`roundData-${index}-${roundInfo.id}`}>
      <TableCell>{roundInfo.id}</TableCell>
      <TableCell>
        { typeof(roundInfo.date) == 'string' ? roundInfo.date : format(roundInfo.date, 'yyyy-MMM-dd HHaa')}
      </TableCell>
      <TableCell align ="center">{roundInfo.totalTickets}</TableCell>
      <TableCell align ="center">
        {roundInfo.userTickets}
        { roundInfo.userTickets && roundInfo.userTickets > 0 &&
            
            <IconButton color="primary" onClick={() => onRoundView(roundInfo.id)} sx ={{ml: 0.5}}>
            <RemoveRedEyeIcon/>
          </IconButton>
        }
      </TableCell>
      <TableCell align="center">{roundInfo.tokenAmount}&nbsp;{roundInfo.token}</TableCell>
   
    </TableRow>
  })


  {/*Building the table with header*/}
  return <Table>
    <TableHead>
      <TableRow> 
        <TableCell align="center">ID</TableCell>
        <TableCell align="center">DATE</TableCell>
        <TableCell align="center">TOTAL TICKETS</TableCell>
        <TableCell align="center">USER TICKETS</TableCell>
        <TableCell align="center">PARTNER BONUS</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {tableRows}
      <TableRow>
        <TablePagination rowsPerPageOptions={[]} rowsPerPage={rowsPerPage} count={totalRounds} page={currentPageView} onPageChange={(e,p) => onPagination(p)}/>
      </TableRow>
    </TableBody>
  </Table>
}

export default History