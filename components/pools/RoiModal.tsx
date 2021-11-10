
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import Divider from "@material-ui/core/Divider"
import Grid from '@material-ui/core/Grid'
import IconButton from "@material-ui/core/IconButton"
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from "@material-ui/core/Typography"
// Icons
import CloseIcon from "@material-ui/icons/Close"
import OpenNew from '@material-ui/icons/OpenInNew';
// Bitcrush
import Card from 'components/basics/Card'
// utils
import { currencyFormat } from 'utils/text/text'

const RoiModal = ( props: RoiProps ) => {
  const { open, onClose, tokenLink, tokenSymbol, apyData } = props

  const css = useStyles({})

  return <Dialog
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
        <IconButton onClick={onClose}>
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