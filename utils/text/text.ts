import BigNumber from "bignumber.js"
/* 
* Receives a number as Eth (normal) or gwei and transforms it into human readable currency
*/
export const currencyFormat = ( amount: number | string, options?:{isWei?: boolean, decimalsToShow?: number } ) => {
  const { isWei = false, decimalsToShow } = options || {}

  const numberAsString = (isWei
    ? new BigNumber(amount).div( new BigNumber(10).pow(18) )
    : new BigNumber(amount) ).toFixed(18)
  const [integers, decimals] = numberAsString.split('.')
  const splitIntegers = integers.split('')
  const integerAmount = integers.split('').length
  const intGroups = []
  for( let i = 0; i < integerAmount; i ++ ){
    const groupLength = intGroups.length
    if(!groupLength || intGroups[0]?.length == 3 )
      intGroups.unshift( splitIntegers.pop() )
    else
      intGroups[0] = splitIntegers.pop() + intGroups[0]
  }
  const joinIntegers = intGroups.join(',')
  const allDecimals = !isNaN(decimalsToShow) 
    ? (decimals || new Array(decimalsToShow).fill(0).join('')).slice(0, decimalsToShow)
    : decimals

  const reviewDecimals = (allDecimals || '00').split('')
  const decimalLength  = reviewDecimals.length
  let significantReached = false
  const finalDecimals = []
  reviewDecimals.map( (d,i) => {
    const index = decimalLength - 1 - i
    if( 
      decimalsToShow && index <= decimalsToShow 
      || decimalsToShow == undefined && index < 2 
      || significantReached 
      || +reviewDecimals[index] > 0
    ){
      significantReached = true
      return finalDecimals.unshift(reviewDecimals[index])
    }
  })

  const decimalString = decimalsToShow === 0 ? '' : `.${finalDecimals.join('')}`

  
  return `${joinIntegers || '0'}${decimalString}`
}

/*
* Take a string for an address and return the first and final 4 digits of the address
* this includes '0x'
*/
export const shortAddress = ( address: string ) => {
  const addressChars = address.split('')
  const itemsToDelete = addressChars.length - 8
  if( itemsToDelete <= 0 ) return address
  addressChars.splice(4, itemsToDelete, '...')
  return addressChars.join('')
}