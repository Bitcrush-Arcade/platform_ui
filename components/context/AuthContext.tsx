// React
import { createContext, ReactNode, useState } from "react"
// Material
import Avatar from "@mui/material/Avatar"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"
// Material Icons
import WalletIcon from '@mui/icons-material/AccountBalanceWallet'
// Bitcrush
import Card from 'components/basics/Card'
// hooks
import { useAuth, ConnectorNames } from 'hooks/web3Hooks'
// data
import wallets from 'data/wallets'

type AuthContextType = {
  login: () => void,
  logout: () => void,
  account?: string | null,
  chainId?: number,
}

export const Context = createContext<AuthContextType>({
  login: () => {},
  logout:() => {},
  account: undefined,
  chainId: undefined,
})

export const AuthContext = (props: { children: ReactNode }) => {
  const { children } = props

  const { login, logout, account, chainId } = useAuth()

  const [ openDialog, setOpenDialog ] = useState<boolean>(false)

  const walletItems = wallets.map( (wallet, walletIdx) => {
    return <ListItem 
      key={`wallet-${walletIdx}-${wallet.name.toLowerCase()}`}
      button
      onClick={ () => {
        login(wallet.type)
        setOpenDialog(false)
      }}
    >
      <ListItemAvatar>
        <Avatar src={wallet.src} variant="square">
          <WalletIcon/>
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={wallet.name}
        secondary={wallet.type}
      />
    </ListItem>
  })

  const checkLogin = () => {
    const connectorId = window.localStorage.getItem('connectorId') as ConnectorNames
    if(connectorId)
      login(connectorId)
    else{
      setOpenDialog(true)
    }
  }

  return <Context.Provider value={{ login: checkLogin, logout, account, chainId }}>
    <Dialog open={openDialog} PaperComponent={ paperProps => { const {sx, ...others} = paperProps; return<Card {...others} />}} onClose={() => setOpenDialog(false)}>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText primary="Select a Wallet to Connect:"
              primaryTypographyProps={{ variant: 'h5', component: 'div'}}
            />
          </ListItem>
          {walletItems}
        </List>
      </DialogContent>
    </Dialog>
    {children}
  </Context.Provider>
}