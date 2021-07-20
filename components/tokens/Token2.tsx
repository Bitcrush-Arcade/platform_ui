// React
import { useMemo } from 'react'
import Image from 'next/image'
// Material
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

const Token2 = (props: TokenImgProps ) => {

  const theme = useTheme()

  const { scale } = props
  const isMd = useMediaQuery( theme.breakpoints.down('md') )
  const width = useMemo( () => 107 * scale / ( isMd ? 1.5 : 1 ), [scale, isMd])
  const height = useMemo( () => 96 * scale / ( isMd ? 1.5 : 1 ), [scale, isMd])
  return <Image src="/token/Coins1.png" width={width} height={height} alt="Crush Coin Img"/>
}

type TokenImgProps ={
  scale?: number
}

export default Token2