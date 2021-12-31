import type BigNumber from 'bignumber.js'
export type TicketInfo = { ticketNumber: string, claimed: boolean }
export type RoundInfo = { 
  totalTickets: BigNumber,
  winnerNumber: string,
  userTickets?: Array<TicketInfo>,
  endTime: BigNumber,
  noMatch: BigNumber,
  match1: BigNumber,
  match2: BigNumber,
  match3: BigNumber,
  match4: BigNumber,
  match5: BigNumber,
  match6: BigNumber,
  pool: BigNumber,
  bonusInfo?: {
    bonusToken: string,
    bonusAmount: BigNumber,
    bonusMaxPercent: BigNumber
  }
}