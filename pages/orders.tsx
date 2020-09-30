import React, {FC} from "react";
import { NextPage } from 'next';
import { useRouter } from "next/router";
import PleaseSignIn from '../components/PleaseSignIn';
import OrderList from '../components/OrderList';
import { useUser } from '../components/User';

interface Props {
  me?: any;
  userAgent?: string;
  userIP?: any;
  urlReferer?: string;
}

const OrderPage: NextPage<Props> = ({ userAgent, userIP, urlReferer }) => {
  const router = useRouter();
  const user = useUser();
  const me = user && !user.error ? user.data.me : null;

  return (
    <div>
      <PleaseSignIn>
        <OrderList me={me} user_ip={userIP} user_Agent={userAgent} url={router.asPath} urlReferer={urlReferer} />
      </PleaseSignIn>
    </div>
  )
}

//Obtain User IP on initial site load
OrderPage.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;

  return { userIP, userAgent, urlReferer }
}

export default OrderPage;
