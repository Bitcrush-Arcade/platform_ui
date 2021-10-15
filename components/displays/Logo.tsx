import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  isGame?: boolean,
  href?: string,
  sizeFactor: number,
}

const Logo = (props: LogoProps)=>{
  const { isGame, href, sizeFactor = 1 } = props
  const image = <Image 
    src={ isGame ? '/logo_light.png' : '/bitcrush_logo.png'}
    width={3685/sizeFactor}
    height={676/sizeFactor}
    title={ isGame ? "Bitcrush Logo" : "Bitcrush logo"}
    alt={ isGame ? "Bitcrush Logo" : "Bitcrush Arcade Logo" }
  />

  return href
  ? <Link passHref href={href}>
    <a>
      {image}
    </a>
  </Link>
  : image
}

export default Logo