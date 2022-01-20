import { Fragment } from 'react'
// Material
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
// BitcrushUI
import Card from 'components/basics/Card'
// Utils
import { imageBuilder } from 'utils/sanityConfig'

type LWSelectModalProps = {
  open: boolean,
  onClose: () => void,
  wallets: Array<{walletIcon?: { alt_title:string, title: string, asset: {_ref:string}}, symbolToken: string, balance?: string, walletBalance?: string}>
}

const LiveWalletSelectModal = (props: LWSelectModalProps) => {
  const { open, onClose, wallets } = props;
  return <Dialog
    open={open}
    onClose={onClose}
    PaperComponent={ paperProps => { const {sx, ...others} = paperProps; return <Card {...others} noBorder background="light" sx={{p: 3, maxHeight: '50vh', width: 320, maxWidth: '95vw'}}/>}}
  >
    <Grid container alignItems="center">
      <Grid item xs={4}>
        <Typography variant="body2" align="center">
          Token
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" align="center">
          LW
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" align="center">
          Wallet
        </Typography>
      </Grid>
      <Grid item xs={12} sx={{py: 2}}>
        <Divider/>
      </Grid>
      {wallets.map( (wallet, walletIndex) => {
        return <Fragment key={`live-wallet-selector-${walletIndex}`}>
        <Tooltip title={<Typography variant="h5">
            {wallet.symbolToken}
          </Typography>
          }
        >
          <Grid item xs={4}>
            <Stack direction="row" alignItems="center" justifyContent="center">
              <Avatar src={wallet.walletIcon?.asset?._ref ? imageBuilder(wallet.walletIcon?.asset?._ref).height(50).width(50).url() || undefined: undefined}>
                N/A
              </Avatar>
            </Stack>
          </Grid>
        </Tooltip>
          <Grid item xs={4}>
              <Typography variant="body2" align="right" sx={{ pr: 2 }}>
            {wallet.balance}
              </Typography>
          </Grid>
          <Grid item xs={4}>
              <Typography variant="body2" align="right" sx={{ pr: 2}}>
            {wallet.walletBalance}
              </Typography>
          </Grid>
          <Grid item xs={12} sx={{ py: 2 }}>
            <Divider/>
          </Grid>
        </Fragment>
      })}
    </Grid>
  </Dialog>
}

export default LiveWalletSelectModal