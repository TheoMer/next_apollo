import React, { memo, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import Form from './styles/Form';
import { useUser } from './User';
import Error from './ErrorMessage';
import SickButton from './styles/SickButton';

interface requestResetReturnData {
  message: string
}

interface requestResetVariables {
  email: string;
}

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

// Request reset
const RequestReset = props => {
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

  // User hook
  const user = useUser();

  // REQUEST RESET MUTATION
  const [requestReset, { error, loading, called }] = useMutation<
  { requestReset: requestResetReturnData }, // This __typename refers to Mutation 
  requestResetVariables
  >(REQUEST_RESET_MUTATION, {
    variables: { email: state.email }
  });

  // User hook variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} page="" />;

  const me = user.data.me;

  const { email } = state;

  const isEnabled = email.length > 0;

  let displayElement;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  if (userType === 'USER') {
    displayElement = (
    <Form
      method="post"
      data-test="form"
      onSubmit={async e => {
        
        e.preventDefault();
        try {

          await requestReset();

        } catch (err) {

          return err;

        }
        setState({
          ...state,
          email: '' 
        });
      }}
    >
      <fieldset disabled={loading} aria-busy={loading}>
        <h2>Request a Password Reset</h2>
        <Error error={error} page="" />
        {!error && !loading && called && <p>Success! Check your email for a reset link!</p>}
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

        <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue}>Request Reset!</SickButton>
      </fieldset>
    </Form>
    )
  } else {
    displayElement = (null)
  }

  return (
    <>
    {displayElement}
    </>
  );
}

export default memo(RequestReset);
export { REQUEST_RESET_MUTATION };
