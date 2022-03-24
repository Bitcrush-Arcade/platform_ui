import { groq } from 'next-sanity'

export const farmAssets = (ids: Array<number>) =>
{
  const numberArr = ids.map(n => '' + n).join(', ')
  return groq`
  *[_type=="poolAssets" && pid in [${numberArr}]] | order(pid){
      pid,
      baseToken->{
      name,
      symbol,
      tokenIcon,
    },
    mainToken->{
      name,
      symbol,
      tokenIcon,
    },
    swapPartner->{
      dex,
      lp,
      name,
      url,
      logo,
      logo_light
    },
    isFarm,
    color,
    highlight
  }
`
}