import React, { FC, memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { gql, useMutation  } from '@apollo/client';
import { useRouter } from 'next/router';
import { useUser, CURRENT_USER_QUERY } from './User';
import Form from './styles/Form';
import Error from './ErrorMessage';
import IpBrowserDetails from './IpBrowserDetails';
import { useCart } from './LocalState';
import { useClient } from '../lib/Client';
import SickButton from './styles/SickButton';
import MyAccountStyles from './styles/MyAccountStyles';

interface createAddressData {
  id: string;
}

interface updateAddressData {
  id: string;
}

const CREATE_ADDRESS_MUTATION = gql`
  mutation CREATE_ADDRESS_MUTATION(
    $userId: String!
    $email: String!
    $card_name: String!
    $address_line: String!
    $city: String!
    $postcode: String!
    $country: String!
  ) {
    createAddress(
      userId: $userId
      email: $email
      card_name: $card_name
      address_line: $address_line
      city: $city
      postcode: $postcode
      country: $country
    ) {
      id
    }
  }
`;

const UPDATE_ADDRESS_MUTATION = gql`
  mutation UPDATE_ADDRESS_MUTATION(
    $userId: ID! 
    $email: String!
    $card_name: String!
    $address_line: String!
    $city: String!
    $postcode: String!
    $country: String!
    ) {
    updateAddress(
      userId: $userId 
      email: $email
      card_name: $card_name
      address_line: $address_line
      city: $city
      postcode: $postcode
      country: $country
      ) {
      id         
    }
  }
`;


const MyAccount = props => {
    const router = useRouter();
    const [state, setState] = useState({
        email: '',
        card_name: '',
        address_line: '',
        city: '',
        postcode: '',
        country: ''
      });

    const saveToState = e => {
        const val = e.target.value ;
        setState({
          ...state,
          [e.target.name]: val.toString()
        });
    };

    const { user_ip, user_Agent, url, urlReferer } = props; //From pages/signup.js
    const { fromCart } = router.query;
    let _isMounted;

    const { openCart } = useCart();

    // Client
    const client = useClient();

    // User hook
    const user = useUser();

    if (!user) return null;
    if (user.error) return <Error error={user.error} page="" />;

    const me = user.data.me;
    let userID = me && me.id;
    let userUpdateID = me && me.address.length >= 1 ? me.address[0].id : 0;
    let userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

    let hasGuestEmail = me && me.email.includes("@guestuser.com");
    let addressExists = me.address.length >= 1 ? true : false;

    // Create Address Mutation
    const [createAddress, { error: errorCreateAddress, loading: loadingCreateAddress }] = useMutation<
    { createAddress: createAddressData }, // This __typename refers to Mutation 
    {}
    >(CREATE_ADDRESS_MUTATION, {
      variables: {
        userId: userID,
        ...state
      },
      refetchQueries: [{ query: CURRENT_USER_QUERY }]
    });

    // Update Address Mutation
    const [updateAddress, { error: errorUpdateAddress, loading: loadingUpdateAddress }] = useMutation<
    { updateAddress: updateAddressData }, // This __typename refers to Mutation 
    {}
    >(UPDATE_ADDRESS_MUTATION, {
      variables: {
        userId: userUpdateID,
        ...state
      },
      refetchQueries: [{ query: CURRENT_USER_QUERY }]
    });

    useEffect(() => {
        // Set default values for each state variable.
        if (me) {
          let emailVal = hasGuestEmail ? '' : me.email;
          let cardName;
          let addressLine;
          let _city;
          let _postcode;
          let _country;

          if (hasGuestEmail === false && userType === 'GUEST_USER') {
            cardName = me.address.length > 0 ? me.address[0].card_name : '';
            addressLine = me.address.length > 0 ? me.address[0].address_line : '';
            _city = me.address.length > 0 ? me.address[0].city : '';
            _postcode = me.address.length > 0 ? me.address[0].postcode : '';
            _country = me.address.length > 0 ? me.address[0].country : '';
          }

          if (userType === 'USER') {
            cardName = me.name;
            addressLine = me.address.length > 0 ? me.address[0].address_line : '';
            _city = me.address.length > 0 ? me.address[0].city : '';
            _postcode = me.address.length > 0 ? me.address[0].postcode : '';
            _country = me.address.length > 0 ? me.address[0].country : '';
          }

          setState({
              email: emailVal,
              card_name: cardName,
              address_line: addressLine,
              city: _city,
              postcode: _postcode,
              country: _country
          });
        }
        return () => {
          clearTimeout(_isMounted)
        };
    }, []);

    var formButton;
    const { email, card_name, address_line, city, postcode, country } = state;

    const isEnabled = email.length > 0 && card_name.length > 0 && address_line.length > 0 && city.length > 0 && postcode.length > 0 && country.length > 0;
    if (fromCart) {
      formButton = (
        <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue} onClick={() => {
          setTimeout(() => { openCart() }, 1000); // 1 second 1000
        }}>
          Create Account!
        </SickButton>
      )
    } else if (!hasGuestEmail || addressExists) {
      formButton = (
        <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue}>Update Account</SickButton>
      )  
    } else if (hasGuestEmail || !addressExists) {
      formButton = (
        <SickButton type="submit" disabled={!isEnabled} background={!isEnabled ? props => props.theme.grey : props => props.theme.blue}>Create Account!</SickButton>
      )
    }

    let loadingVal = hasGuestEmail === false && userType === 'GUEST_USER' ? loadingCreateAddress : loadingUpdateAddress;
    let errorVal = hasGuestEmail === false && userType === 'GUEST_USER' ? errorCreateAddress : errorUpdateAddress;

    if (loadingVal) return <p>Loading...</p>;

    let displayElement;

    if (userType === 'USER') {
      displayElement = (
        <Link href="/signup">
          <a>Request a new password</a>
        </Link>
      )
    }

    return (
        <>
        <IpBrowserDetails userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} />
        <Form
          method="post"
          onSubmit={async e => {

            e.preventDefault();
            try {

              me && me.address.length === 0 ? await createAddress() : await updateAddress();
    
            } catch (err) {
    
              return err;
    
            }
            
            //await createAddress();
            setState({ email: '', card_name: '', address_line: '', city: '', postcode: '', country: ''});
            /* Now redirect user to previous page */
            if (fromCart) {
              router.back();
              _isMounted = setTimeout(() => { openCart() }, 1000); // 1 second 1000
            } else {
              router.push({
                pathname: '/',
              })
            }
          }}
        >
          <fieldset disabled={loadingVal} aria-busy={loadingVal}>
            <h2>{me && me.address.length === 0 ? 'Enter ' : 'Update '} your delivery address and email details.</h2>
            <Error error={errorVal} page='account' />
            <label htmlFor="card_name">
              Name
              <input
                type="text"
                id="card_name"
                name="card_name"
                placeholder="name on card"
                defaultValue={state.card_name}
                onChange={saveToState}
                required
              />
            </label>

            <label htmlFor="address_line">
              Street
              <input
                type="text"
                id="address_line"
                name="address_line"
                placeholder="first line of address"
                defaultValue={state.address_line}
                onChange={saveToState}
                required
              />
            </label>

            <label htmlFor="city">
              City
              <input
                type="text"
                id="city"
                name="city"
                placeholder="city"
                defaultValue={state.city}
                onChange={saveToState}
                required
              />
            </label>

            <label htmlFor="postcode">
              Post Code
              <input
                type="text"
                id="postcode"
                name="postcode"
                placeholder="post code"
                defaultValue={state.postcode}
                onChange={saveToState}
                required
              />
            </label>

            <label htmlFor="country">
              Country
              <input
                type="text"
                id="country"
                name="country"
                placeholder="country"
                defaultValue={state.country}
                onChange={saveToState}
                required
              />
            </label>

            <label htmlFor="email">
              Email
              <input
                type="email"
                name="email"
                placeholder="email"
                autoComplete="username"
                defaultValue={state.email}
                onChange={saveToState}
                required
              />
            </label>
    
            {formButton}
          </fieldset>
        </Form>

        <MyAccountStyles>
          {displayElement}
        </MyAccountStyles>
        </>
    );
}

export default memo(MyAccount);
