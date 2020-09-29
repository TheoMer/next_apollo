import React, { createContext, useState, useContext, useEffect } from 'react';

const LocalStateContext = createContext(null);
const LocalStateProvider = LocalStateContext.Provider;

const CartStateProvider = props => {
  const [cartOpen, setCartOpen] = useState(false);
  const [loadingToCart, setloadingToCart] = useState(false);
  const [state, setState] = useState({
    userip: '',
    useragent: '',
    url: '',
    referer: '',
  });

  useEffect(() => {
    const userip = localStorage.getItem('coolapp-user');
    const useragent = localStorage.getItem('coolapp-useragent');
    const url = localStorage.getItem('coolapp-url');
    const referer = localStorage.getItem('coolapp-referer');

    if (userip) {
        setState({
          ...state,
          userip
        });
      }

      if (useragent) {
        setState({
          ...state,
          useragent
        });
      }

      if (url) {
        setState({
          ...state,
          url
        });
      }

      if (referer) {
        setState({
          ...state,
          referer
        });
      }
  }, []);

  const userIp = (val) => {
    localStorage.setItem('coolapp-user', val);

    setState({
      ...state,
      userip: val,
    });
  };

  const userAgent = (val) => {
    localStorage.setItem('coolapp-useragent', val);

    setState({
      ...state,
      useragent: val,
    });
  };

  const userUrl = (val) => {
    localStorage.setItem('coolapp-url', val);

    setState({
      ...state,
      url: val
    });
  };

  const urlReferer = (val) => {
    localStorage.setItem('coolapp-referer', val);

    setState({
      ...state,
      referer: val
    });
  }; 

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  }

  const closeCart = () => {
    setCartOpen(false);
  }

  const openCart = () => {
    setCartOpen(true);
  }

  const addItemToCart = (val) => {
    setloadingToCart(val);
  }

  return (
    <LocalStateProvider value={{ cartOpen, toggleCart, openCart, closeCart, user: state.userip, user_agent: state.useragent, urlContext: state.url, referer: state.referer, refererFunc: urlReferer, useripFunc: userIp, userAgentFunc: userAgent, userUrlFunc: userUrl, loadingToCartFunc: addItemToCart, loadingToCart }}>
      {props.children}
    </LocalStateProvider>
  );
}

function useCart() {
  const all = useContext(LocalStateContext);
  return all;
}

export { CartStateProvider, LocalStateContext, useCart };
