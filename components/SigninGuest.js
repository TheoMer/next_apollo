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

const SIGNINGUEST_MUTATION = gql`
  mutation SIGNINGUEST_MUTATION($email: String!, $userId: String!) {
    updateGuestEmail(email: $email, userId: $userId) {
      id
      permissions2
      name
      email
      resetStore @client
    }
  }
`;

const SigninGuest = props => {
  const router = useRouter();
  const { user_ip, user_Agent, url, urlReferer } = props; //From pages/signup.js
  const { fromCart } = router.query;
  let _isMounted;
  const { openCart } = useCart();

  const [state, setState] = useState({
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

  // User hook variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} />;

  const me = user.data.me;

  const userID = me && me.id;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  // SIGNIN MUTATION
  const [signup, { error: errorSignIn, loading: loadingSignIn }] = useMutation(SIGNINGUEST_MUTATION, {
    variables: {
      userId: userID,
      email: state.email
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY }]
  });

  const { email } = state;

  const isEnabled = email.length > 0;

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

          await signup();

        } catch (err) {

          return err;

        }
        
        setState({
          ...state,
          email: '' 
        });
        /* Now redirect user to previous page */
        if (fromCart) {
          router.back();
          _isMounted = setTimeout(() => { openCart() }, 1000); // 1 second 1000
        } else {
          router.push({
            pathname: '/'
          })
        }
      }}
    >
      <fieldset disabled={loadingSignIn} aria-busy={loadingSignIn}>
        <h2>Sign In As a Guest User</h2>
        <Error error={errorSignIn} />
        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            placeholder="email"
            value={state.email}
            onChange={saveToState}
            required
          />
        </label>
        <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue}>Sign In!</SickButton>
      </fieldset>
    </Form> 
    );
  }
 
  return (
    <>
    <IpBrowserDetails client={client} userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} urlReferer={urlReferer} />
    {displayElement}
    </>
  );
}

export default memo(SigninGuest);
