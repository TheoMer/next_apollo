import React from 'react';
import { useRouter } from "next/router";
import PleaseSignIn from '../components/PleaseSignIn';
import MyAccount from '../components/MyAccount';

const Account = props => {
  const router = useRouter();
  return(
    <div>
      <PleaseSignIn>
        <MyAccount id={props.query.id} user_ip={props.userIP} user_Agent={props.userAgent} url={router.asPath} urlReferer={props.urlReferer} />
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
