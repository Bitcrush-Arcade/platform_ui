export type Wallet = {
  status: boolean,
  walletIcon: { alt_title:string, title: string, asset: {_ref:string}},
  walletContract: any,
  tokenName: any,
  symbolToken:string,
  balance?: string,
  walletBalance?: string,
  timelock?: string, // The time when address was locked in
  isTimelockActive?: boolean //If the lock has run it's course it returns false
}