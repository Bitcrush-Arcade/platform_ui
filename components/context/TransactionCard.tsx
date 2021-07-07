import { useMemo } from 'react'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import IconButton from '@material-ui/core/IconButton'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from "@material-ui/core/Grid"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
// Icons
import CheckIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorIcon from '@material-ui/icons/ErrorOutline'
import LaunchIcon from '@material-ui/icons/Launch'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
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

  return <Card background="dark" className={ css.card } shadow="dark">
    <Grid container alignItems="center" justify="space-between" >
      <Grid item>
        {usedIcon[ hashes[ keys[0] ].status ] }
      </Grid>
      <Grid item>
        <Tooltip arrow
          title={ <Typography variant="caption">
              { first.description}<br/>{keys[0]}
            </Typography>}
        >
          <Typography noWrap className={ css.description }>
            { first.description || shortAddress(keys[0])}
          </Typography>
        </Tooltip>
        <a href={`https://${chainId == 97 ? 'testnet.': ''}bscscan.com/tx/${keys[0]}`} target="_blank" className={ css.link}>
          <Typography color="secondary" variant="caption">
            view on BSCscan <LaunchIcon fontSize="inherit"/>
          </Typography>
        </a>
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