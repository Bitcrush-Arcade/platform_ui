// import App from 'next/app'
import { useEffect } from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import baseTheme from '../styles/BaseTheme'

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if( jssStyles ){
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  return <ThemeProvider theme={baseTheme}>
    <Component {...pageProps} />
  </ThemeProvider>
}

export default MyApp
