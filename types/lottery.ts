import type BigNumber from 'bignumber.js'
export type TicketInfo = { ticketNumber: string, claimed: boolean }
export type RoundInfo = { 
  totalTickets: BigNumber,
  winnerNumber: string,
  userTickets?: Array<TicketInfo>,
  endTime: BigNumber,
  bonusInfo?: {
    bonusToken: string,
    bonusAmount: BigNumber,
    bonusMaxPercent: BigNumber
  }
}