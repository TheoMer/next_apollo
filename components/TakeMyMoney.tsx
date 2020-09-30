import React, { memo, useState } from 'react';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { gql, useMutation } from '@apollo/client';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import calcTotalPrice from '../lib/calcTotalPrice';
import { useUser, CURRENT_USER_QUERY } from './User';
import { ALL_ITEMS_QUERY } from './Items';
import { useCart } from './LocalState';
import SickButton from './styles/SickButton';
import formatMoney from '../lib/formatMoney';

interface Item {
  id: string;
  title: string;
  itemid: string;
}

interface Order {
  id: string;
  charge: string;
  total: string;
  items: Item[];
}

interface createOrderdata {
  createOrder: Order
}

// We use loadStripe because is load in their lib async
const stripe = loadStripe('pk_test_nY9Zq7TnPwvkc4trLiW4mD0b');

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!, $address_line: String!, $city: String!, $postcode: String!, $country: String!, $card_brand: String!, $last4card_digits: String!, $card_name: String!) {
    createOrder(token: $token, address_line: $address_line, city: $city, postcode: $postcode, country: $country, card_brand: $card_brand, last4card_digits: $last4card_digits, card_name: $card_name) {
      id
      charge
      total
      items {
        id
        title
        itemid
      }
    }
  }
`;

const style = {
  base: {
    fontSize: '18px',
  },
};

function TakeMyMoney() {
  return (
    <>
      <Elements stripe={stripe}>
        <CheckoutForm />
      </Elements>
    </>
  );
}

function useCheckout() {
  const router = useRouter();
  const stripeCheck = useStripe();
  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const elements = useElements();
  const { closeCart } = useCart();
  const user = useUser();

  const [createOrder] = useMutation<createOrderdata, {}>(CREATE_ORDER_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }, { query: ALL_ITEMS_QUERY }]
  });

  // User hook variables

  const me = user.data.me;

  const handleSubmit = async event => {
    setLoading(true);
    setError('' as any);
    // 1. Stop the form from submitting
    event.preventDefault();

    if (!stripeCheck || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      // Taken from: https://stripe.com/docs/payments/accept-a-payment-synchronously#create-a-paymentmethod
      return;
    }

    // 2. Start the page transition to show the user something is happening
    NProgress.start();

    // 3. Create the payment method
    const { error, paymentMethod } = await stripeCheck.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)
      //billing_details: {name: 'Jenny Rosen'},
    });

    // 4. Handle any errors
    if (error) {
      NProgress.done();
      return setError(error as any);
    }

    //console.log("Payment Method Object = ", paymentMethod);

    if (paymentMethod.billing_details.address.postal_code === null) {
      NProgress.done();
      setLoading(false);
      const errorMsg = {
        message: 'A valid post code is required.'
      };
      return setError(errorMsg as any);
    }

    // 5. Send it to the server and charge it
    const order = await createOrder({
      variables: {
        token: paymentMethod.id,
        address_line: me.address[0].address_line, //paymentMethod.billing_details.address.line1,
        city: me.address[0].city, //paymentMethod.billing_details.address.city,
        postcode: me.address[0].postcode, //paymentMethod.billing_details.address.postal_code,
        country: me.address[0].country, //paymentMethod.billing_details.address.country,
        card_brand: paymentMethod.card.brand,
        last4card_digits: paymentMethod.card.last4,
        card_name: me.address[0].card_name //paymentMethod.billing_details.name,
      },
    })
    .catch(err => {
      setError(err);
      return err;
    });

    // Test if the transaction has failed
    // -1 is the dummy id established in the return object created in 
    // backend/Mutation.js -> createOrder -> charge
    
    if (order && order.data.createOrder.id === '-1') {
      const errorMsg = {
        message: order.data.createOrder.charge
      };
      NProgress.done();
      setError(errorMsg as any);
      setLoading(false);
      return error;
    }

    // An error was generated that did not fall within the parameters 
    // of errorArray in Mutation.js -> createOrder
    if (order === undefined) {
      NProgress.done();
      setLoading(false);
      return error;
    }

    // 6. Change the page to the new order
    router.push({
      pathname: '/order',
      query: { id: order.data.createOrder.id, onToken: true }
    });

    // 6. Close the cart
    closeCart();

    // 7. Turn loader off
    setLoading(false);
  };

  return { error, handleSubmit, loading };
}

const CheckoutFormStyles = styled.form`
  box-shadow: 0 1px 2px 2px rgba(0, 0, 0, 0.04);
  border: 0px solid rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  padding: 0rem;
  display: grid;
  grid-gap: 1rem;
`;

function CheckoutForm() {
  try {
    const { handleSubmit, error, loading } = useCheckout();
    const user = useUser();
    const me = user.data.me;
    let errorCheck = error?.type == 'validation_error' ? true : false;
    let safeLoad = loading && errorCheck != true ? true : false;

    return (
      <CheckoutFormStyles onSubmit={handleSubmit} data-testid="checkout">
        {/*{error && <p>{`Error: `+ error.message}</p>}*/}
        <CardElement options={{ style }} />
        <SickButton disabled={safeLoad || !stripe} background={safeLoad || !stripe ? props => props.theme.grey : props => props.theme.blue}>{safeLoad ? 'Processing...' : 'Pay ' + formatMoney(calcTotalPrice(me.cart))}</SickButton>
      </CheckoutFormStyles>
    );
  } catch (err) {
    console.log("The error is = ", err);
  }
}

export default memo(TakeMyMoney);
export { CREATE_ORDER_MUTATION };
