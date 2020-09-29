import React, {FC} from "react";
import { NextPage } from 'next';
import { useRouter } from "next/router";
import UpdateItem from '../components/UpdateItem';

interface Props {
  query?: {
    id: string
  };
  userAgent?: string;
  userIP?: any;
  urlReferer?: string;
}

const Update: NextPage<Props> = ({ query, userAgent, userIP, urlReferer }) => {

  const router = useRouter();

  return(
    <div>
      <UpdateItem id={query.id} user_ip={userIP} user_Agent={userAgent} url={router.asPath} urlReferer={urlReferer} />
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
