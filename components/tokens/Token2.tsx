// React
import { useMemo } from 'react'
import Image from 'next/image'
// Material
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const Token = (props: TokenImgProps ) => {

  const theme = useTheme()

  const { scale, token } = props
  const isLive = token === 'LIVE'
  const isMd = useMediaQuery( theme.breakpoints.down('lg') )
  const width = useMemo( () => ( isLive ? 165 : 107) * scale / ( isMd ? 1.5 : 1 ), [scale, isMd, isLive])
  const height = useMemo( () => ( isLive ? 95 : 96) * scale / ( isMd ? 1.5 : 1 ), [scale, isMd, isLive])
  return <Image src={`/token/${ !isLive ? "Coins1" : "coin2_wBg"}.png`} width={width} height={height} alt={`Crush Coin${isLive ? ' Live Wallet':''} Image`}/>
}

type TokenImgProps ={
  scale?: number,
  token?: 'CRUSH' | 'LIVE'
}

export default Token