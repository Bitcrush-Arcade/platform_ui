import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(
  roundInfo: string,
  teamInfo: any,
  
) {
  return { roundInfo, teamInfo };
}

const rows = [
  createData('WINNING TEAM', 'PLACEHOLDER'),
  createData('TICKET INFO', 'PLACEHOLDER'),
  
];
{/*const teamArray = Array()
const ticketArray = Array()*/}

export default function BasicTable() {
  return (
    
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ROUND 3 </TableCell>
            <TableCell>DATE AND TIME OF ROUND</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={`current-view-${rowIndex}`}>
              <TableCell>{row.roundInfo}</TableCell>
              <TableCell>{row.teamInfo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    
  );
}