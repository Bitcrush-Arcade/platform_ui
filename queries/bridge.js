import { groq } from 'next-sanity'

export const bridgeChains = groq`
  *[_type == "chain" && active]{
    chainId,
    symbol,
    chainName,
    chainIcon
  }
`