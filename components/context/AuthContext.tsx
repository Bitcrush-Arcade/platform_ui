// React
import { createContext, ReactNode, useState, useMemo } from "react"
import Image from 'next/image'
// Material
import Avatar from "@material-ui/core/Avatar"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import ListItemText from "@material-ui/core/ListItemText"
// Material Icons
import WalletIcon from '@material-ui/icons/AccountBalanceWallet'
// Bitcrush
import Card from 'components/basics/Card'
// hooks
import { useAuth, ConnectorNames } from 'hooks/web3Hooks'
// data
import wallets from 'data/wallets'
import { useWeb3React } from "@web3-react/core"

type AuthContextType = {
  login: () => void,
  logout: () => void,
  account?: string,
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

  const [ openDialog, setOpenDialog ] = useState<boolean>(true)

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
        <Avatar src={wallet.src}>
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
    <Dialog open={openDialog} PaperComponent={ paperProps => <Card {...paperProps} />} onClose={() => setOpenDialog(false)}>
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