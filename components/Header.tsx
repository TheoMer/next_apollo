import React, { memo } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import NProgress from 'nprogress';
import Router from 'next/router';
import Nav from './Nav';
import Cart from './Cart';
import Search from './Search';

//Progress bar
Router.onRouteChangeStart = () => {
  NProgress.start();
};
Router.onRouteChangeComplete = () => {
  NProgress.done();
};

Router.onRouteChangeError = () => {
  NProgress.done();
};

const Logo = styled.h1`
  font-size: 4rem;
  margin-left: 2rem;
  position: relative;
  z-index: 2;
  transform: skew(-7deg);
  a {
    padding: 0.5rem 1rem;
    /* background: ${props => props.theme.blue}; */
    background: white;
    /* background-image: url(${props => props.theme.image}); */ /* Called in from Page.js */
    /* color: white; */
    color: black;
    text-transform: uppercase;
    text-decoration: none;
  }
  @media (max-width: 1250px) { /* originally 1300px. At 1300 Flamingo sits above nav */
    margin: 0;
    text-align: center;
  }
`;

const StyledHeader = styled.header`
  /* The following 4 lines fix the header and hide the content as */
  /* it scrolls underneath the search and header bars */
  position: fixed;
  width: 100%;
  z-index: 64;
  background: white;
  .bar {
    border-bottom: 10px solid ${props => props.theme.black};
    display: grid;
    grid-template-columns: auto 1fr;
    justify-content: space-between;
    align-items: stretch;
    @media (max-width: 1250px) { /* originally 1300px. At 1300 nav sits underneath Flamingo */
      grid-template-columns: 1fr;
      justify-content: center;
    }
  }
  .sub-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    border-bottom: 1px solid ${props => props.theme.lightgrey};
  }
`;

const Header = () => (
  <StyledHeader>
    <div className="bar">
      <Logo>
        <Link href="/">
          <a>Flamingo</a>
        </Link>
      </Logo>
      <Nav />
    </div>
    <div className="sub-bar">
      <Search />
    </div>
    <Cart />
  </StyledHeader>
);

export default memo(Header);
