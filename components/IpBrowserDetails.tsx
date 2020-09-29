import React, { FC, memo, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useCart } from './LocalState';
import { useClient } from '../lib/Client';

const CREATE_SITEVISITS_MUTATION = gql`
  mutation CREATE_SITEVISITS_MUTATION(
    $userID: String
    $userType: String
    $url: String
    $userAgent: String
    $userIP: String
    $urlReferer: String
  ) {
    createSiteVisits(
      data: {
        userID: $userID,
        userType: $userType,
        url: $url,
        userAgent: $userAgent,
        userIP: $userIP,
        urlReferer: $urlReferer,
      },
    ) {
      id
    }
  }
`;

interface Props {
  userID: string; 
  userType: string; 
  user_ip: any;
  user_Agent: string; 
  url: string;
}

// IpBrowserDetails. 
const IpBrowserDetails: FC<Props> = ({ userID, userType, user_ip, user_Agent, url }) => {
  const client = useClient();
  const { useripFunc, userAgentFunc, userUrlFunc, user, referer, urlContext, refererFunc } = useCart(); //useContext(UserContext);
  
  useEffect(() => {
    if (user_ip !== false) {
      useripFunc(user_ip);
      userAgentFunc(user_Agent);
      refererFunc(url)
      userUrlFunc(url)
    }

    if (urlContext !== '') {
      refererFunc(url)
      userUrlFunc(url)

      // Write to Prisma
      client.mutate({
        mutation: CREATE_SITEVISITS_MUTATION,
        variables: {
          userID,
          userType,
          url,
          userAgent: user_Agent,
          userIP: user,
          urlReferer: referer,                    
        }
      })
      .catch(error => console.log(error));
    }
  },[url]);

  return (
    null
  )
}

export default memo(IpBrowserDetails);
