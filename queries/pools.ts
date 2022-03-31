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
export const pools = groq`
  *[_type=="tp_pool" && !hidden] | order(created_date){
    contract,
    rewardToken->{
      name,
      symbol,
      tokenIcon,
    },
    stakeToken->{
      name,
      symbol,
      tokenIcon,
    },
    color,
    highlight,
    active,
    tags
  }
`