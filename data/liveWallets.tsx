import InvaderIcon from "components/svg/InvaderIcon"

export const liveWallets : {
  [key in wallets]?:{
    symbol: string,
    contract: string,
    icon: React.ReactNode | JSX.Element
  }
} = {
  'crush':{
    symbol: 'CRUSH',
    contract: '',
    icon: <InvaderIcon/>
  }
}

export type wallets = 'crush' | 'bnb' | 'busd'