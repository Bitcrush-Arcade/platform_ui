import Link, { LinkProps } from 'next/link'
import { ReactNode } from 'react'

export const ConditionalLinkWrapper = ( props: { children: ReactNode, url?: string, LinkProps?: Omit<LinkProps, "href">, isA?: boolean}) => {
  const { children, url, LinkProps, isA } = props
  if(url){
    return isA 
    ?
      <a href={url} {...LinkProps} style={{textDecoration: 'none'}}>
        {children}
      </a>
    : 
      <Link href={url} {...LinkProps}>
        {children}
      </Link>
  }
  return <>
    {children}
  </>
}