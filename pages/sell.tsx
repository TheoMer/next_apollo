import React from 'react';
import { NextPage } from 'next';
import { useRouter } from "next/router";
import CreateItem from '../components/CreateItem';
import PleaseSignInAdmin from '../components/PleaseSignInAdmin';

interface Props {
  userAgent?: string;
  userIP?: any;
}

const Sell: NextPage<Props> = props => {
  const router = useRouter();
  return(
    <div>
      <PleaseSignInAdmin>
        <CreateItem user_ip={props.userIP} user_Agent={props.userAgent} url={router.asPath} />
      </PleaseSignInAdmin>
    </div>
  );
}

//Obtain User IP on initial site load
Sell.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;

  return { userIP, userAgent, urlReferer }
}

export default Sell;
