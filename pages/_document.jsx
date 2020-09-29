import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import getConfig from 'next/config';
// Only holds serverRuntimeConfig and publicRuntimeConfig from next.config.js nothing else.
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

const inlineScript = (body, nonce) => (
  <script
    type='text/javascript'
    dangerouslySetInnerHTML={{ __html: body }}
    nonce={nonce}
  />
)

export default class MyDocument extends Document {
/*
  static getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const page = ctx.renderPage(App => props => sheet.collectStyles(<App {...props} />));
    const styleTags = sheet.getStyleElement();
    const { styleNonce } = ctx.res.locals
    return { ...page, styleTags, styleNonce };
  }
*/
  static async getInitialProps (ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />)
        })

      const initialProps = await Document.getInitialProps(ctx)
      const { styleNonce } = ctx.res.locals //publicRuntimeConfig

      return {
        ...initialProps,
        styleTags: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
        styleNonce
      }
    } catch (error) {
      //handle error
      console.error(error)
    } finally {
      sheet.seal()
    }
  }

  render() {
    const { styleTags, styleNonce} = this.props;
    //const styleNonce = process.env.styleNonce;
    return (
      <Html lang="en" prefix="og: http://ogp.me/ns#">
        <Head nonce={styleNonce}>
        {/*<Head>*/}
          {/*{inlineScript(`window.__webpack_nonce__="${styleNonce}"`, styleNonce)}*/}
          {inlineScript(`console.log('Inline script with nonce')`, styleNonce)}
          {styleTags}
        </Head>
        <body>
          <Main />
          <NextScript nonce={styleNonce} />
          {/*<NextScript />*/}
        </body>
      </Html>
    );
  }
}
