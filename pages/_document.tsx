import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import ServerStyleSheets from '@mui/styles/ServerStyleSheets';

class MyDocument extends Document {

  render() {
    return (
      <Html>
        <Head>
          {/* Add external scripts here */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-FHLPYG3GMV"></script>
          <script
            dangerouslySetInnerHTML={ { __html:`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-FHLPYG3GMV');
            `}}
          >
          </script>
        </Head>
        <body style={{margin: 0}}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

MyDocument.getInitialProps = async (ctx) => {

  const sheets = new ServerStyleSheets()
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () => originalRenderPage({
    enhanceApp: (App) => (props) => sheets.collect(<App {...props }/>),
  });

  const initialProps = await Document.getInitialProps(ctx)
  return { ...initialProps,
    styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()]
  }
}

export default MyDocument