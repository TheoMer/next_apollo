import React from 'react';
import { NextPage } from 'next';
import { useRouter } from "next/router";
import styled from 'styled-components';
import Signup from '../components/Signup';
import Signin from '../components/Signin';
import SigninGuest from '../components/SigninGuest';
import RequestReset from '../components/RequestReset';

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

interface Props {
  userAgent?: string;
  userIP?: any;
  urlReferer?: string;
}

const SignupPage: NextPage<Props> = ({ userIP, userAgent, urlReferer }) => {
  const router = useRouter();
  return(
    <Columns>
      <Signup user_ip={userIP} user_Agent={userAgent} url={router.asPath} urlReferer={urlReferer} />
      <Signin user_ip={userIP} user_Agent={userAgent} url={router.asPath} urlReferer={urlReferer} />
      <SigninGuest user_ip={userIP} user_Agent={userAgent} url={router.asPath} urlReferer={urlReferer} />
      <RequestReset />
    </Columns>
  );
}

//Obtain User IP on initial site load
SignupPage.getInitialProps = async ({ req }) => {
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const urlReferer = req ? req.headers['referer'] : document.referrer;

  return { userIP, userAgent, urlReferer }
}

export default SignupPage;
