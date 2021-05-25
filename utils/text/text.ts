
// Receives a number as Eth (normal) or gwei and transforms it into human readable currency
export const currencyFormat = ( amount: number, options?:{isGwei?: boolean, decimalsToShow?: number } ) => {
  const { isGwei = false, decimalsToShow } = options || {}

  const numberAsString = (isGwei
    ? amount/( 10 ** 18 )
    : amount ).toString()
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
    ? decimals.slice(0, decimalsToShow)
    : decimals

  const decimalString = decimalsToShow === 0 ? '' : `.${allDecimals || '00'}`

  
  return `${joinIntegers || '0'}${decimalString}`
}