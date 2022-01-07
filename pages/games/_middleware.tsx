import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// This middleware handles looking at the country to make sure it's being sent to Dragon for gambling requirements
export default function getCountry( req:NextRequest ){
  const { geo, nextUrl: url } = req
  console.log('middleware',geo)
  url.searchParams.set('country', geo?.country || "CR")
  return NextResponse.rewrite( url )
}