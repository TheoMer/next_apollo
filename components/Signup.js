import React, { memo, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useRouter  } from 'next/router';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { useUser, CURRENT_USER_QUERY } from './User';
import IpBrowserDetails from './IpBrowserDetails';
import { useCart } from './LocalState';
import { useClient } from '../lib/Client';
import SickButton from './styles/SickButton';


const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`;

const Signup = props => {
  const router = useRouter();
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

  const { user_ip, user_Agent, url, urlReferer } = props; //From pages/signup.js
  const { fromCart } = router.query;

  const { openCart } = useCart();

  // Client
  const client = useClient();

  // User hook
  const user = useUser();

  // SIGNUP MUTATION
  const [signup, { error: errorSignUp, loading: loadingSignUP }] = useMutation(SIGNUP_MUTATION, {
    variables: {
      ...state
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY }]
  });

  // User hook varaibles
  if (!user) return null;
  if (user.error) return <Error error={user.error} />;

  const me = user.data.me;
  let userID = me && me.id;
  let userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';
  let displayElement;

  const { email, password, name } = state;

  const isEnabled = email.length > 0 && password.length > 0 && name.length > 0;

  // SIGNUP MUTATION variables
  var formButton;

  if (fromCart) {
    formButton = (
      <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue} onClick={() => {
        setTimeout(() => { openCart() }, 1000); // 1 second 1000
      }}>
        Sign Up!
      </SickButton>
    )
  } else {
    formButton = (
      <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue}>Sign Up!</SickButton>
    )
  }

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
        
        setState({ name: '', email: '', password: '' });
        /*Now redirect user to shop */
        router.push({
          pathname: '/'
        });
      }}
    >
      <fieldset disabled={loadingSignUP} aria-busy={loadingSignUP}>
        <h2>Sign Up for An Account</h2>
        <Error error={errorSignUp} page='signup' />
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

        <label htmlFor="name">
          Name
          <input
            type="text"
            name="name"
            placeholder="name"
            autoComplete="user-name"
            value={state.name}
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
            autoComplete="new-password"
            value={state.password}
            onChange={saveToState}
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
            //onInvalid="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
            required
          />
        </label>
        {formButton}
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

export default memo(Signup);
export { SIGNUP_MUTATION };
