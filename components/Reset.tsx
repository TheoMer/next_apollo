import React, { FC, memo, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import bcrypt from 'bcryptjs';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import IpBrowserDetails from './IpBrowserDetails';
import { useUser } from './User';
import SickButton from './styles/SickButton';
import { useClient } from '../lib/Client';

interface resetPasswordInputData {
  resetToken: string;
  password: number;
  confirmPassword: number;
}

interface resetPasswordVariables {
  resetToken: string;
  password: string; 
  confirmPassword: string;
}

const RESET_MUTATION = gql`
  mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
      id
      email
      name
    }
  }
`;

interface Props {
  user_ip: string; 
  user_Agent: string; 
  url: string;
  resetToken: string;
}

const Reset: FC<Props> = ({ resetToken, user_ip, user_Agent, url }) => {
  // Client
  const client = useClient();

  const router = useRouter();
  const [state, setState] = useState({
    password: '',
    confirmPassword: ''
  });

  const saveToState = e => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  };

  //console.log("resetToken = ", props.resetToken);

  //const { user_ip, user_Agent, url, urlReferer } = props; // From pages/reset.js

  // User hook
  const user = useUser();
  let resetError;

  // Reset Mutation
  let [resetPassword, { error: errorReset, loading: loadingReset }] = useMutation<
  { resetPassword: resetPasswordInputData },
  resetPasswordVariables
  >(RESET_MUTATION, {
    variables: {
      resetToken: resetToken,
      password: state.password,
      confirmPassword: state.confirmPassword
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY, variables: {} }]
  });

  resetError = errorReset;

  // User hook variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} page="" />;

  const me = user.data.me;

  const userID = me && me.id;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  const { password, confirmPassword } = state;

  const isEnabled = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const isEnabledCheck = () => {
    if (isEnabled) {
      try {
        let promise = bcrypt.compareSync(password, me.password);
        
        if (promise) {
          resetError = {
            message: 'passwordexists'
          }
          return false;
        } else  {
          return true;
        }
      } catch(err) {
        console.log("Process failed because: ", err);
      } 
    } else if (password != confirmPassword) {
      resetError = {
        message: 'unequalpasswords'
      }
      return false;
    } else {
      return false;
    }
  }

  // If I don't make the function call here as well the error message
  // displayed if the entered password and stored password are equal
  // will not be displayed
  isEnabledCheck();

  let displayElement;

  if (userType === 'USER') {
    displayElement = (
    <Form
      method="post"
      onSubmit={async e => {

        e.preventDefault();
        try {

          await resetPassword();

        } catch (err) {

          return err;

        }
      
        setState({
          ...state,
          password: '', 
          confirmPassword: '' 
        });
        
        /* Now redirect user to shop */
        router.push({
          pathname: '/'
        });
      }}
    >
      <fieldset disabled={loadingReset} aria-busy={loadingReset}>
        <h2>Reset Your Password</h2>
        <Error error={resetError} page='reset' />
        <label htmlFor="password">
          Password
          <input
            type="password"
            name="password"
            placeholder="password"
            autoComplete="new-password"
            value={state.password}
            onChange={saveToState}
            //pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            //title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters" 
            required
          />
        </label>

        <label htmlFor="confirmPassword">
          Confirm Your Password
          <input
            type="password"
            name="confirmPassword"
            placeholder="confirmPassword"
            autoComplete="new-password"
            value={state.confirmPassword}
            onChange={saveToState}
            //pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            //title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters" 
            required
          />
        </label>
        <SickButton type="submit" disabled={!isEnabledCheck()} background={!isEnabledCheck() ? props => props.theme.grey : props => props.theme.blue}>Reset Your Password!</SickButton>
      </fieldset>
    </Form>
    )
  } else {
    displayElement = (null);
  }

  return (
    <>
    <IpBrowserDetails userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} />
    {displayElement}
    </>
  );
}

Reset.propTypes = {
  resetToken: PropTypes.string.isRequired,
};

export default memo(Reset);

