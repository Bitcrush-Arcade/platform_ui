import { useMemo } from 'react'
// Material
import { Theme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from "@mui/material/Grid"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
// Icons
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorIcon from '@mui/icons-material/ErrorOutline'
import LaunchIcon from '@mui/icons-material/Launch'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
// Bitcrush
import Card from 'components/basics/Card'
// libs
import { shortAddress } from 'utils/text/text'
// Types
import { TransactionHash } from 'types/TransactionTypes'
import { useWeb3React } from '@web3-react/core'

export default function TxCard( props: TxCardProps ){

  const { hashes, onClose } = props
  const { chainId } = useWeb3React()
  const css = useStyles({})
  const keys = Object.keys(hashes)
  const usedIcon = {
    pending: <CircularProgress color="secondary" size={32}/>,
    success: <CheckIcon className={ css.statusIcon } color="secondary"/>,
    error: <ErrorIcon className={ css.statusIcon } color="error"/>
  }
  const first = hashes[ keys[0] ]
  const isError = !!first.errorMsg
  const validKey = /^0x([A-Fa-f0-9]{64})$/.test(keys[0])
  return <Card background="dark" className={ css.card } shadow="dark">
    <Grid container alignItems="center" justifyContent="space-between" >
      <Grid item>
        {usedIcon[ isError ? 'error' : first.status ] }
      </Grid>
      <Grid item>
        <Tooltip arrow
          title={ <Typography variant="caption">
              { first.description || first.errorMsg}<br/>{keys[0]}
            </Typography>}
        >
          <Typography noWrap className={ css.description }>
            { first.description || first.errorMsg || shortAddress(keys[0])}
          </Typography>
        </Tooltip>
        {validKey && <a href={`https://${chainId == 97 ? 'testnet.': ''}bscscan.com/tx/${keys[0]}`} target="_blank" className={ css.link} rel="noreferrer">
          <Typography color="secondary" variant="caption">
            view on BSCscan <LaunchIcon fontSize="inherit"/>
          </Typography>
        </a>}
      </Grid>
      <Grid item>
        <IconButton size="small" onClick={() => onClose(keys[0])}>
          <HighlightOffIcon className={ css.closeIcon } />
        </IconButton>
      </Grid>
    </Grid>
  </Card>
}

type TxCardProps = {
  hashes: TransactionHash,
  onClose?: (hash: string) => void,
}

const useStyles = makeStyles<Theme>( theme => createStyles({
  card:{
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: 256,
  },
  description:{
    maxWidth: 110
  },
  link:{
    textDecoration: 'none'
  },
  closeIcon:{
    color: theme.palette.text.secondary
  },
  statusIcon:{
    fontSize: 32
  }
}) )