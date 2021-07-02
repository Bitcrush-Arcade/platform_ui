// import App from 'next/app'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import getTheme from 'styles/BaseTheme'
// BlockChain
import Web3 from 'web3'
import { Web3ReactProvider } from '@web3-react/core'
// Context
import { TransactionLoadingContext } from 'components/context/TransactionContext'

function MyApp({ Component, pageProps }) {

  const [ dark, setDark ] = useState<boolean>( true )

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if( jssStyles ){
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  const getLibrary = ( provider ): Web3 => provider

  const basicTheme = getTheme(dark)

  const toggle = () => {
    setDark( p => !p )
  }

  return (<Web3ReactProvider getLibrary={ getLibrary }>
    <TransactionLoadingContext toggleDark={toggle} dark={dark} >
      <ThemeProvider theme={basicTheme}>
        <CssBaseline/>
        <Component {...pageProps} />
      </ThemeProvider>
    </TransactionLoadingContext>
  </Web3ReactProvider>
  )
}

export default MyApp