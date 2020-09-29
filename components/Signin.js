import React, { memo, useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { useUser, CURRENT_USER_QUERY } from './User';
import IpBrowserDetails from './IpBrowserDetails';
import { useCart } from './LocalState';
import { useClient } from '../lib/Client';
import SickButton from './styles/SickButton';

// @client is used as follows:
// https://www.apollographql.com/docs/react/essentials/local-state/#integrating-client-into-remote-queries

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
      resetStore @client
    }
  }
`;

const Signin = props => {
  const router = useRouter();
  const { user_ip, user_Agent, url, urlReferer } = props; //From pages/signup.js
  const { fromCart } = router.query;
  let pathname = router.pathname;
  let _isMounted;
  const { openCart } = useCart();

  const [state, setState] = useState({
    name: '',
    password: '',
    email: ''
  });

  const saveToState = e => {
    const val = e.target.value ;
    setState({
      ...state,
      [e.target.name]: val.toString()
    });
  };

  useEffect(() => {

    return () => {
      clearTimeout(_isMounted)
    };
  },[urlReferer]);

  // Client
  const client = useClient();

  // User hook
  const user = useUser();

  // SIGNIN MUTATION
  const [signin, { error: errorSignIn, loading: loadingSignIn }] = useMutation(SIGNIN_MUTATION, {
    variables: {
      ...state
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY }]
  });

  // User hook variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} />;

  const me = user.data.me;

  const userID = me && me.id;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  const { email, password } = state;

  const isEnabled = email.length > 0 && password.length > 0;

  let displayElement;

  if (userType === 'USER') {
    displayElement = (null)
  } else {
    displayElement = (
    <Form
      method="post"
      onSubmit={async e => {

        e.preventDefault();
        try {

          await signin();

        } catch (err) {

          return err;

        }
        
        setState({
          ...state,
          name: '',
          email: '',
          password: ''
        });
        /* Now redirect user to previous page */
        if (fromCart) {
          router.back();
          _isMounted = setTimeout(() => { openCart() }, 1000); // 1 second 1000
        } else if (pathname && (pathname === '/orders' || pathname === '/reset')) {
        } else {
          router.push({
            pathname: '/'
          })
        }
      }}
    >
      <fieldset disabled={loadingSignIn} aria-busy={loadingSignIn}>
        <h2>Sign Into Your Account</h2>
        <Error error={errorSignIn} page='signin' />
        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            placeholder="email"
            autoComplete="username"
            value={state.email}
            onChange={saveToState}
            required
          />
        </label>
        <label htmlFor="password">
          Password
          <input
            type="password"
            name="password"
            placeholder="password"
            autoComplete="current-password"
            value={state.password}
            onChange={saveToState}
            required
          />
        </label>
        <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue}>Sign In!</SickButton>
      </fieldset>
    </Form>
    )
  }

  return (
    <>
    <IpBrowserDetails client={client} userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} urlReferer={urlReferer} />
    {displayElement}
    </>
  );

}

export default memo(Signin);
