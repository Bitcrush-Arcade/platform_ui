// import App from 'next/app'
import { useEffect } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
// Context
import ContextProviders from 'components/context/ContextProviders'

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if( jssStyles ){
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  return (<ContextProviders>
      <CssBaseline/>
      <Component {...pageProps} />
    </ContextProviders>
  )
}

export default MyApp