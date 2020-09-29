import React from 'react';
import { useRouter } from "next/router";
import Reset from '../components/Reset';
import PleaseSignIn from '../components/PleaseSignIn';

const ResetPass = props => {
  const router = useRouter();
  return(
    <div>
      {/*<p>Reset Your Password {props.query.resetToken}</p>*/}
      <PleaseSignIn>
        <Reset resetToken={props.query.resetToken} user_ip={props.userIP} user_Agent={props.userAgent} url={router.asPath} urlReferer={props.urlReferer} />
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
