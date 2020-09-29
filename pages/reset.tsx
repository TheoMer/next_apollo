import React from 'react';
import { NextPage } from 'next';
import { useRouter } from "next/router";
import Reset from '../components/Reset';
import PleaseSignIn from '../components/PleaseSignIn';

interface Props {
  query?: {
    resetToken: string
  };
  userAgent?: string;
  userIP?: any;
}

const ResetPass: NextPage<Props> = ({ query, userAgent, userIP }) => {
  const router = useRouter();
  return(
    <div>
      {/*<p>Reset Your Password {props.query.resetToken}</p>*/}
      <PleaseSignIn>
        <Reset resetToken={query.resetToken} user_ip={userIP} user_Agent={userAgent} url={router.asPath} />
      </PleaseSignIn>
    </div>
  );
}

//Obtain User IP on initial site load
ResetPass.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;

  return { userIP, userAgent, urlReferer }
}

export default ResetPass;
