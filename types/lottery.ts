import type BigNumber from 'bignumber.js'
export type TicketInfo = string
export type RoundInfo = { 
  totalTickets: BigNumber,
  winnerNumber: string,
  userTickets?: Array<TicketInfo>,
  endTime: BigNumber,
  distribution: Array<BigNumber>,
  pool: BigNumber,
  bonusInfo?: {
    bonusToken: string,
    bonusAmount: BigNumber,
    bonusMaxPercent: BigNumber
  }
}