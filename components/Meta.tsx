import React, { memo } from 'react';
import Head from 'next/head';

const Meta = () => (
  <Head>
    <meta charSet="utf-8" />
    <title>Flamingo | Women's Swimwear | Ethically Made In The UK</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta name="description" content="A unique selection of beautifully designed, and ethically made, swimwear for women produced/manufactured in the UK. Next day delivery and free returns available" />
    <meta name="google-site-verification" content="8ObF7c2TQv9Vrw2XHWH_k0H8J-F9H8E6x3rncmdodxY" />
    <link rel="shortcut icon" href="/static/favicon.png" />
    <link rel="stylesheet" type="text/css" href="/static/nprogress.css" />
    <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
    <meta property="og:title" content="Flamingo | Women's Swimwear | Ethically Made In The UK" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://frontend.theomer.co.uk/" />
    <meta property="og:image:secure_url" content="https://frontend.theomer.co.uk/static/favicon.png" />
  </Head>
);

export default memo(Meta);
