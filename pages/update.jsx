import React from 'react';
import { useRouter } from "next/router";
import UpdateItem from '../components/UpdateItem';

const Update = props => {
  const router = useRouter();
  return(
    <div>
      <UpdateItem id={props.query.id} user_ip={props.userIP} user_Agent={props.userAgent} url={router.asPath} />
    </div>
  );
}

// Obtain User IP on initial site load
Update.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;

  return { userIP, userAgent, urlReferer }
}

export default Update;
