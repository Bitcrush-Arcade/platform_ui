
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

const RoiModal = ( props: RoiProps ) => {
  const { open, onClose, tokenLink, tokenSymbol } = props

  const css = useStyles({})

  return <Dialog
    open={open}
    PaperComponent={ paperProps => <Card {...paperProps} noBorder className={ css.card } />}
    onClose={onClose}
  >
    <Grid container justify="space-between" alignItems="center">
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
          <TableCell>ROI</TableCell>
          <TableCell>Per $1000</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>1d</TableCell>
          <TableCell align="right">0.21%</TableCell>
          <TableCell align="right">0.13</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>7d</TableCell>
          <TableCell align="right">1.42%</TableCell>
          <TableCell align="right">0.88</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>30d</TableCell>
          <TableCell align="right">6.26%</TableCell>
          <TableCell align="right">3.87</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>365d (APY)</TableCell>
          <TableCell align="right">109.36%</TableCell>
          <TableCell align="right">67.6</TableCell>
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
    <Grid container justify="center">
      <Button color="secondary" className={ css.getToken } href={tokenLink} target="_blank" disabled={!tokenLink}>
        GET {tokenSymbol}&nbsp;<OpenNew fontSize="small" />
      </Button>
    </Grid>
  </Dialog>
}

export default RoiModal

type RoiProps = {
  open: boolean,
  onClose: () => void,
  tokenSymbol: string,
  tokenLink: string,
}

const useStyles = makeStyles<Theme>( theme => createStyles({
  card:{
    padding: theme.spacing(3),
    boxShadow: 'none',
    minWidth: 320,
    maxWidth: 360,
  },
  divider:{
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  getToken:{
  }
}))