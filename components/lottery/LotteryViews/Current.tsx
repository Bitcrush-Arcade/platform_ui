import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

{/* History table props */}
type CurrentViewProps = {
  ticketNumber: string,
  currentPageView: number,
  onPagination: (newPage: number) => void,
  onRoundView: (roundId: number) => void,
}

{/* History table props and formatting */}
const Current = (props: CurrentViewProps) => {
  const { ticketNumber, currentPageView, onPagination, onRoundView } = props

  

return null

}