import React from 'react';
import { NextPage } from 'next';
import { useRouter } from "next/router";
import Items from '../components/Items';

interface Props {
  query?: {
    page: string
  };
  userAgent?: string;
  userIP?: any;
  urlReferer?: string;
}

const Home: NextPage<Props> = ({ query, userAgent, userIP, urlReferer }) => {
  const router = useRouter();
  return (
    <div>
      <Items page={parseFloat(query.page) || 1} user_ip={userIP} user_Agent={userAgent} url={router.asPath} urlReferer={urlReferer} />
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
