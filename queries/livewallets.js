import { groq } from 'next-sanity'

export const liveWalletsQuery = groq`
*[_type == "liveWallet"]{
  ...,
  'symbolToken': tokenName->symbol,
  tokenName->
}
`