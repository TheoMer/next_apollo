import React, { memo } from 'react';
import { gql, useMutation } from '@apollo/client';
import { CURRENT_USER_QUERY } from './User';
import SignOutButton from './styles/SignOutButton';

// @client is used as follows:
// https://www.apollographql.com/docs/react/essentials/local-state/#integrating-client-into-remote-queries

const SIGN_OUT_MUTATION = gql`
  mutation SIGN_OUT_MUTATION {
    signout {
      message
      resetStore @client
    }
  }
`;

// Sign out
const Signout = props => {

  const [signout, { loading, error }] = useMutation(SIGN_OUT_MUTATION, {
    optimisticResponse: {
      __typename: 'Mutation',
      signout: {
        __typename: 'SuccessMessage',
        message: 'Goodbye!'
      }
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY, variables: {} }]
  });

  return (
    <SignOutButton onClick={signout}>SIGNOUT</SignOutButton>
 )
};

export default memo(Signout);
