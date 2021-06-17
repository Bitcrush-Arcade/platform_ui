import Image from 'next/image'


const Token2 = (props: TokenImgProps ) => {
  const { scale } = props
  const width = 107 * scale
  const height = 96 * scale
  return <Image src="/token/Coins1.png" width={width} height={height} alt="Crush Coin Img"/>
}

type TokenImgProps ={
  scale?: number
}

export default Token2