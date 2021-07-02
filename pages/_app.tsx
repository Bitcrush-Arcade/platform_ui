// import App from 'next/app'
import { useEffect } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
// BlockChain
import Web3 from 'web3'
import { Web3ReactProvider } from '@web3-react/core'
// Context
import { TransactionLoadingContext } from 'components/context/TransactionContext'

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if( jssStyles ){
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  const getLibrary = ( provider ): Web3 => provider

  return (<Web3ReactProvider getLibrary={ getLibrary }>
    <TransactionLoadingContext>
      <CssBaseline/>
      <Component {...pageProps} />
    </TransactionLoadingContext>
  </Web3ReactProvider>
  )
}

export default MyApp