import React from 'react';
import App, { Container } from 'next/app';
import Page from '../components/Page';
import { ApolloProvider } from '@apollo/client';
import withData from '../lib/withData';
import { CartStateProvider } from '../components/LocalState';
// Loading in css here as as it acts as an initialisation process.
// import SingleItemStyles from '../public/static/SingleItemStyles.css';

/*class MyApp extends App {

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    // This exposes the query to the user...
    pageProps.query = ctx.query;
    return { pageProps };
  }

  render() {
    const { Component, apollo, pageProps } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <CartStateProvider>
          <Page>
            <Component {...pageProps} />
          </Page>
        </CartStateProvider>
        </ApolloProvider>
    );
  }
}*/

function MyApp(props) {
  const { Component, apollo, pageProps } = props;
  return (
    <ApolloProvider client={apollo}>
      <CartStateProvider>
        <Page>
          <Component {...pageProps} />
        </Page>
      </CartStateProvider>
    </ApolloProvider>
  );
}
// every page in the app will be server-side rendered because data has to be fetched before rendering
MyApp.getInitialProps = async props => {
  const { Component, ctx } = props;
  let pageProps = {};

  // console.log('this runs first, before the App is rendered');
  if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
      //console.log('_app Component, pageProps', pageProps);
  }

  // this exposes the query to the user
  // console.log('_app ctx.query', ctx.query);
  pageProps.query = ctx.query;
  return { pageProps };
};

export default withData(MyApp);
