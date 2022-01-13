import type BigNumber from 'bignumber.js'
export type TicketInfo = {ticketNumber: string, round: string}
export type RoundInfo = { 
  totalTickets: BigNumber,
  winnerNumber: string,
  userTickets?: Array<TicketInfo>,
  endTime: BigNumber,
  distribution: Array<BigNumber>,
  pool: BigNumber,
  totalWinners: BigNumber,
  bonusInfo?: {
    bonusToken: string,
    bonusAmount: BigNumber,
    bonusMaxPercent: BigNumber
  }
}