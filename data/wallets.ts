import { ConnectorNames } from "hooks/web3Hooks"

const wallets: Array<WalletDescriptor> = [
  {
    name: "Metamask",
    src: '/assets/thirdPartyLogos/metamask.png',
    type: ConnectorNames.INJECTED
  },
  {
    name: "Wallet Connect",
    src: '/assets/thirdPartyLogos/walletConnect.jpg',
    type: ConnectorNames.WALLET_CONNECT
  },
  {
    name: "Other Injected",
    src: "",
    type: ConnectorNames.INJECTED,
  }
]

export default wallets

type WalletDescriptor = {
  name: string,
  src: string,
  type: ConnectorNames,
  icon?: JSX.Element
}