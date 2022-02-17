import { AppProps } from 'next/app';
import '../styles/globals.css'
import CssBaseline from '@mui/material/CssBaseline'
import { EmotionCache } from '@emotion/react';
import createEmotionCache from 'utils/styles/styling'
// Context
import ContextProviders from 'components/context/ContextProviders'

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

function MyApp(props:MyAppProps) {
  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props
  return (<ContextProviders emotionCache={emotionCache}>
      <CssBaseline/>
      <Component {...pageProps} />
    </ContextProviders>
  )
}

export default MyApp