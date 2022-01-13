const WINNERBASE = 1000000
const MAXBASE =    2000000

export const standardizeNumber = ( number: number ) => {
    if( number <= WINNERBASE)
      return number + WINNERBASE
    else if( number >= MAXBASE)
      return (number % WINNERBASE) + WINNERBASE
    else
      return number
}

export const getTicketDigits = (number: number) => {
  const digits = standardizeNumber(number).toString().split('')
  const allDigits = []
  for( let i = 1 ; i <= digits.length; i++){
    allDigits.push( digits.slice(0,i).join(''))
  }
  allDigits.shift()
  return allDigits
}

export const checkTicket = (ticketToCheck: string, winnerNumber: string) => {
  const winningDigits = winnerNumber.split('')
  const ticketDigits = ticketToCheck.split('')
  const digitsMatched = ticketDigits.reduce( (acc, value, index) => {
    if(value === winningDigits[index] && acc === index){
      return acc + 1
    }
    return acc
  },0)
  return digitsMatched -1
}