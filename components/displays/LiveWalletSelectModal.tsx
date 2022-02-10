import { Fragment } from 'react'
// Material
import Avatar from '@mui/material/Avatar'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
// BitcrushUI
import Button from 'components/basics/SmallButton'
import Card from 'components/basics/Card'
// Utils
import { imageBuilder } from 'utils/sanityConfig'
import { currencyFormat } from 'utils/text/text'
// Types
import { Wallet } from 'types/liveWallets'

type LWSelectModalProps = {
  open: boolean,
  onClose: () => void,
  wallets: Array<Wallet>,
  onWalletSelected: (walletAddress: string) => void,
}

const LiveWalletSelectModal = (props: LWSelectModalProps) => {
  const { open, onClose, wallets, onWalletSelected } = props;
  return <Dialog
    open={open}
    onClose={onClose}
    PaperComponent={ paperProps => { const {sx, ...others} = paperProps; return <Card {...others} noBorder background="light" sx={{p: 3, maxHeight: '50vh', width: 320, maxWidth: '95vw'}}/>}}
  >
      <Typography variant="h4" align="center">
        Live Wallets
      </Typography>
    
      {wallets.map( (wallet, walletIndex) => {
        return <ButtonBase 
          onClick={() => onWalletSelected(wallet.symbolToken)}
          key={`live-wallet-selector-${walletIndex}`}
          sx={{px: 2, maxWidth: '100%'}}
        >
          <Stack direction="row" alignItems="center"
            sx={{
              py: 1,
              borderBottom: theme => `solid 1px ${theme.palette.grey[700]}`,
              maxWidth: 300,
            }}
          >
            <Tooltip arrow title={<Typography variant="h6">
                {wallet.symbolToken}
              </Typography>
              }
            >
              <Avatar 
                src={wallet.walletIcon?.asset?._ref ? imageBuilder(wallet.walletIcon?.asset?._ref).height(50).width(50).url() || undefined: undefined}
                sx={{ width: {xs: 24, sm: 36}, height: {xs: 24, sm: 36}, fontSize: 16}}
              >
                N/A
              </Avatar>
            </Tooltip>
            <Typography variant="body2" align="right" sx={{ pr: 2, width:{ xs: 100, sm: 120}, fontSize: { xs: 12, sm: 16} }}>
              {currencyFormat(wallet?.balance || 0,{decimalsToShow: 4})}
            </Typography>
            <Typography variant="body2" align="right" sx={{ pr: 2, width:{ xs: 100, sm: 120}, fontSize: { xs: 12, sm: 16}}}>
              {currencyFormat(wallet?.walletBalance || 0, { decimalsToShow: 4})}
            </Typography>
          </Stack>
        </ButtonBase>
      })}
  </Dialog>
}

export default LiveWalletSelectModal