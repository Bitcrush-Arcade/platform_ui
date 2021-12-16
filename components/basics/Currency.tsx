import AnimatedNumber from 'animated-number-react'
import BigNumber from 'bignumber.js'
// Bitcrush
// Utils
import { currencyFormat } from 'utils/text/text'

type CurrencyProps = {
  value: string | number | BigNumber,
  decimals?: number,
  isWei?: boolean,
}

const Currency = (props: CurrencyProps) => {
  const { value, decimals, isWei} = props
  const filter = isWei ? new BigNumber(value).div(10**18).toString() : value.toString()
  return <AnimatedNumber
    value={filter}
    formatValue={
      (val:number) => currencyFormat(val, { decimalsToShow: decimals })
    }
  />
}

export default Currency 