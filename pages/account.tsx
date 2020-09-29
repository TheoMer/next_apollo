import React from 'react';
import { NextPage } from 'next';
import { useRouter } from "next/router";
import PleaseSignIn from '../components/PleaseSignIn';
import MyAccount from '../components/MyAccount';

interface Props {
  query?: {
    id: string
  };
  userAgent?: string;
  userIP?: any;
  urlReferer?: string;
}

const Account: NextPage<Props> = ({ query, userAgent, userIP, urlReferer }) => {
  const router = useRouter();
  return(
    <div>
      <PleaseSignIn>
        <MyAccount id={query.id} user_ip={userIP} user_Agent={userAgent} url={router.asPath} urlReferer={urlReferer} />
      </PleaseSignIn>
    </div>
  );
}

// Obtain User IP on initial site load
Account.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;
  
  return { userIP, userAgent, urlReferer }
}

export default Account;
