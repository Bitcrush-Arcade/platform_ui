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
  }>,
  totalRounds: number,
  currentPageView: number,
  onPagination: (newPAage: number) => void,
  rowsPerPage:number,
}

{/* History table props and formatting */}
const History = (props: HistoryViewProps) => {
  const { rounds, totalRounds, currentPageView, onPagination, rowsPerPage } = props
  
  const tablerows = (rounds||[]).map( (roundInfo, index) => {
    return <TableRow key={`roundData-${index}-${roundInfo.id}`}>
      <TableCell>{roundInfo.id}</TableCell>
      <TableCell>{format(roundInfo.date, 'MMMM dd-yyyy')}</TableCell>
      <TableCell align ="right">{roundInfo.totalTickets}</TableCell>
      <TableCell align ="right">
        {roundInfo.userTickets}
        <IconButton color="primary">
          <RemoveRedEyeIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  })
  return <Table>
    <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>DATE</TableCell>
        <TableCell>TOTAL TICKETS</TableCell>
        <TableCell>USER TICKETS</TableCell>
        </TableRow>
    </TableHead>
    <TableBody>
      {tablerows}
      <TablePagination rowsPerPageOptions={[]} rowsPerPage={rowsPerPage} count={totalRounds} page={currentPageView} onPageChange={(e,p) => onPagination(p)}/>
    </TableBody>
  </Table>
}

export default History