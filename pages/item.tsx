import SingleItem from '../components/SingleItem';
import { withRouter } from "next/router";

import SingleItemStyles from '../public/static/SingleItemStyles.css';

const Item = props => (
  <div>
    <style dangerouslySetInnerHTML={{ __html: SingleItemStyles }} />
    <SingleItem id={props.query.id} user_ip={props.userIP} user_Agent={props.userAgent} url={props.router.asPath} urlReferer={props.urlReferer} />
  </div>
);

// Obtain User IP on initial site load
Item.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;
  
  return { userIP, userAgent, urlReferer }
}

export default withRouter(Item);
