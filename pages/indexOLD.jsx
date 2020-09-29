import React from 'react';
import { useRouter } from "next/router";
import Items from '../components/Items';

const Home = props => {
  const router = useRouter();
  return (
    <div>
      <Items page={parseFloat(props.query.page) || 1} user_ip={props.userIP} user_Agent={props.userAgent} url={router.asPath} urlReferer={props.urlReferer} />
    </div>
  );
}

//Obtain User IP on initial site load.
Home.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;

  return { userIP, userAgent, urlReferer }
}

export default Home;
