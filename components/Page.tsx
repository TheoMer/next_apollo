import React, { memo } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Header from './Header';
import Meta from './Meta';

//Styles
const theme = {
  red: '#FF0000',
  blue: '#000000', //'#0000FF',
  black: '#393939',
  grey: '#848482',
  lightgrey: '#bdbdbd',
  offWhite: '#FAEBD7', //'#a5a5a5',
  maxWidth: '1000px',
  bs: '0 12px 24px 0 rgba(0, 0, 0, 0.09)'
  //image: '' /* Specify an image URL here. See: Header.js
};

const StyledPage = styled.div`
  background: white;
  color: ${props => props.theme.black};
`;

const Inner = styled.div`
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
  /* The following handles scrolling */
  /* Taken from: https://stackoverflow.com/questions/9677894/header-div-stays-at-top-vertical-scrolling-div-below-with-scrollbar-only-attach */
  /* and: https://stackoverflow.com/questions/16670931/hide-scroll-bar-but-while-still-being-able-to-scroll */
  position: relative;
  top: 190px;
  left:0px;
  right:0px;
  bottom:0px;
  /*scroll-behavior: inherit;
  overflow: scroll;
  /*overflow-x: hidden;
  -ms-overflow-style: none;  /* IE 10+ */
  /*scrollbar-width: none;   /* Firefox */
  /*overflow: -moz-scrollbars-none; /* For older versions of firefox */
  /*::-webkit-scrollbar {
      display: none;  /* Safari and Chrome */
      /*width: 0px;  /* Remove scrollbar space */
      /*background: transparent;  /* Optional: just make scrollbar invisible */
  /*}
  /* Optional: show position indicator in red */
  /*::-webkit-scrollbar-thumb {
      background: #FF0000;
  }*/  
`;

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'radnika_next';
    src: url('/static/radnikanext-medium-webfont.woff2') format('woff2');
    font-weight: normal;
    font-style: normal; 
    /*Taken from: https://www.styled-components.com/docs/faqs#how-do-i-fix-flickering-text-after-server-side-rendering */
    font-display: fallback; /* This eliminates flickering text after server-side rendering */
  }
  html {
    box-sizing: border-box;
    font-size: 10px;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  body {
    padding: 0;
    margin: 0;
    font-size: 1.5rem;
    line-height: 2;
    font-family: 'radnika_next';
  }
  a {
    text-decoration: none;
    color: ${theme.black};
  }
  button {  
    font-family: 'radnika_next';
    color: ${theme.black};
  }
`;

const Page = props => {
  return (
    <ThemeProvider theme={theme}>
      <StyledPage>
        <GlobalStyle />
        <Meta />
        <Header />
        <Inner>{props.children}</Inner>
      </StyledPage>
    </ThemeProvider>
  );
}

export default memo(Page);
