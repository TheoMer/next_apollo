import { NextPage } from 'next';
import { useRouter } from 'next/router';
import PleaseSignIn from '../components/PleaseSignIn';
import Order from '../components/Order';

interface Props {
  query?: {
    id: string
  };
  userAgent?: string;
  userIP?: any;
  urlReferer?: string;
}

const OrderPage: NextPage<Props> = ({ query, userAgent, userIP, urlReferer }) => {

  const router = useRouter();

  return(
    <div>
      <PleaseSignIn>
        <Order id={query.id} user_ip={userIP} user_Agent={userAgent} url={router.asPath} urlReferer={urlReferer} />
      </PleaseSignIn>
    </div>
  );
}

//Obtain User IP on initial site load
OrderPage.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;

  return { userIP, userAgent, urlReferer }
}

export default OrderPage;
