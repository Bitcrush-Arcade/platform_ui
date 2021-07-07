import Link, { LinkProps } from 'next/link'
import { ReactNode } from 'react'

export const ConditionalLinkWrapper = ( props: { children: ReactNode, url?: string, LinkProps?: Omit<LinkProps, "href"> }) => {
  const { children, url, LinkProps } = props
  if(url)
    return <Link href={url} {...LinkProps}>
      {children}
    </Link>
  return <>
    {children}
  </>
}