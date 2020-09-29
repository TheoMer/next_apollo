import React, { memo } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { useUser, CURRENT_USER_QUERY } from './User';
import IpBrowserDetails from './IpBrowserDetails';
import { useClient } from '../lib/Client';
import SickButton from './styles/SickButton';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`;

const SigninAdmin = props => {
  const router = useRouter();
  const [state, setState] = useState({
    name: '',
    password: '',
    email: ''
  });

  saveToState = e => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  };

  const { user_ip, user_Agent, url, urlReferer } = props; //From pages/signup.js

  // Client
  const client = useClient();

  // User hook
  const user = useUser();

  // SIGNIN MUTATION
  const [signup, { error: errorSignIn, loading: loadingSignIn }] = useMutation(SIGNIN_MUTATION, {
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

  return (
    <>
    <IpBrowserDetails client={client} userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} urlReferer={urlReferer} />
    <Form
      method="post"
      onSubmit={async e => {
        
        e.preventDefault();
        try {

          await signup();

        } catch (err) {

          return err;

        }
        
        setState({ name: '', email: '', password: '' });
        /*Now redirect user to required section */
        router.push({
          pathname: router.pathname
        });
      }}
    >
      <fieldset disabled={loadingSignIn} aria-busy={loadingSignIn}>
        <h2>You must be signed in as an Admin.</h2>
        <Error error={errorSignIn} />
        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            placeholder="email"
            autoComplete="username"
            value={state.email}
            onChange={saveToState}
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
          />
        </label>
        <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue}>Sign In!</SickButton>
      </fieldset>
    </Form>
    </>
  );
}

export default memo(SigninAdmin);
