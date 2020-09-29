import React, { memo } from 'react';
import { useQuery } from '@apollo/client';
import { CURRENT_USER_QUERY } from './User';
import SigninAdmin from './SigninAdmin';

interface PleaseSignInAdminData {
  me: any;
}

const PleaseSignInAdmin = ({ children }) => {

  const { data, error, loading } = useQuery<PleaseSignInAdminData, {}>(CURRENT_USER_QUERY, {
    fetchPolicy: 'cache-first',
    returnPartialData: true
  });
  
  if (!data) return null;
  const me = data.me;

  let Admin = me && me.permissions2.some(permission => ['ADMIN'].includes(permission));
      
  if (loading) return <p>Loading...</p>;
  if (!Admin) {
    return (
      <div>
        <SigninAdmin />
      </div>
    );
  }
  
  return (
    children
  )
};

export default memo(PleaseSignInAdmin);
