
// Material
import { Theme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Divider from "@mui/material/Divider"
import Grid from '@mui/material/Grid'
import IconButton from "@mui/material/IconButton"
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from "@mui/material/Typography"
// Icons
import CloseIcon from "@mui/icons-material/Close"
import OpenNew from '@mui/icons-material/OpenInNew';
// Bitcrush
import Card from 'components/basics/Card'
// utils
import { currencyFormat } from 'utils/text/text'

const RoiModal = ( props: RoiProps ) => {
  const { open, onClose, tokenLink, tokenSymbol, apyData } = props

  const css = useStyles({})

  return (
    <Dialog
      open={open}
      PaperComponent={ paperProps => <Card {...paperProps} noBorder className={ css.card } background="light" />}
      onClose={onClose}
    >
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item >
          <Typography variant="h5" align="right">
            &nbsp;&nbsp;ROI
          </Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={onClose} size="large">
            <CloseIcon fontSize="small"  color="secondary" />
          </IconButton>
        </Grid>
      </Grid>
      <Divider className={ css.divider} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Timeframe</TableCell>
            <TableCell align="center">ROI</TableCell>
            <TableCell align="center">Per $1000</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>1d</TableCell>
            <TableCell align="right">{(apyData?.d1?.percent *100).toFixed(2) + ' %'}</TableCell>
            <TableCell align="right">{apyData?.d1?.return && currencyFormat(apyData?.d1?.return, { decimalsToShow: 2 }) || '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>7d</TableCell>
            <TableCell align="right">{(apyData?.d7?.percent *100).toFixed(2) + ' %'}</TableCell>
            <TableCell align="right">{apyData?.d7?.return && currencyFormat(apyData?.d7?.return, { decimalsToShow: 2 }) || '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>30d</TableCell>
            <TableCell align="right">{(apyData?.d30?.percent *100).toFixed(2) + ' %'}</TableCell>
            <TableCell align="right">{apyData?.d30?.return && currencyFormat(apyData?.d30?.return, { decimalsToShow: 2 }) || '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>365d (APY)</TableCell>
            <TableCell align="right">{(apyData?.d365?.percent *100).toFixed(2) + ' %'}</TableCell>
            <TableCell align="right">{apyData?.d365?.return && currencyFormat(apyData?.d365?.return, { decimalsToShow: 2 }) || '-'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <br/>
      <Typography color="textSecondary" variant="caption" paragraph align="center" component="p">
        Calculated based on current rates. Compounding 288x daily. Rates are estimates provided for your convienience only and by no means represent guaranteed returns.
      </Typography>
      <Typography color="textSecondary" variant="caption" paragraph align="center" component="p">
        All estimated rates take into account this pool&apos;s 3% performance fee.
      </Typography>
      <Grid container justifyContent="center">
        <Button color="secondary" className={ css.getToken } href={tokenLink} target="_blank" disabled={!tokenLink}>
          GET {tokenSymbol}&nbsp;<OpenNew fontSize="small" />
        </Button>
      </Grid>
    </Dialog>
  );
}

export default RoiModal

export type RoiProps = {
  open: boolean,
  onClose: () => void,
  tokenSymbol: string,
  tokenLink: string,
  apyData?:{
    d1: ROIData,
    d7: ROIData,
    d30: ROIData,
    d365: ROIData,
    b1?: ROIData,
    b7?: ROIData,
    b30?: ROIData,
    b365?: ROIData,
  }
}

type ROIData = {
  return: number,
  percent: number,
}

const useStyles = makeStyles<Theme>( theme => createStyles({
  card:{
    padding: theme.spacing(3),
    boxShadow: 'none',
    minWidth: 320,
    maxWidth: 640,
  },
  divider:{
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  getToken:{
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.common.white,
    '&:hover':{
      backgroundColor: theme.palette.secondary.dark,
    }
  }
}))