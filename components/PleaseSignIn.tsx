import React, { memo } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { CURRENT_USER_QUERY } from './User';
import Signin from './Signin';

interface PleaseSignInData {
  me: any;
}

const PleaseSignIn = ({ children }) => {
  const router = useRouter();
  const { data } = useQuery<PleaseSignInData, {}>(CURRENT_USER_QUERY);
  let pathname = router.pathname;
  
  const me = data && data.me;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  if (!me || (userType !== 'USER' && (pathname === '/orders' || pathname === '/reset'))) {
    return (
      <div>
        {/*<p>Please Sign In before Continuing</p>*/}
        <Signin />
      </div>
    );
  }
  
  return (
    children
  )
};

export default memo(PleaseSignIn);
