import React, { memo }  from 'react';
import { useRouter } from 'next/router';
import { useUser } from './User';
import styled from 'styled-components';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import CartItem from './CartItem2';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import TakeMyMoney from './TakeMyMoney';
import { useCart } from './LocalState';

const CheckoutFormStyles = styled.form`
  box-shadow: 0 1px 2px 2px rgba(0, 0, 0, 0.04);
  border: 0px solid rgba(255, 255, 255, 0.0);
  border-radius: 5px;
  padding: 0rem;
  display: grid;
  grid-gap: 1rem;
`;

//Cart
const Cart = props => {
  const router = useRouter();
  const { toggleCart, cartOpen, closeCart } = useCart();

  // User hook
  const user = useUser();
  if (!user) return null;

  const me = user.data.me;

  if (!me || (user.loading && me.cart == [])) return null;

  const hasGuestPerms = (me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? true : false;
  const hasGuestEmail = me.email.includes("@guestuser.com");
  const email = me.email.split("@");
  const cartCount = me.cart.reduce((a, b) => a + b.quantity, 0);
  let addressExists = me.address.length >= 1 ? true : false;

  const signIn = () => {
    alert('Please enter your delivery address and email details to continue purchase.');

    // Redirect user to account page
    router.push({
      pathname: '/account',
      query: { fromCart: 'true' }
    });

    // Close cart window
    closeCart();
  };

  function addItemsToCart() {
    alert('Add an item to the cart to make a payment.');
  
    // Redirect user to items page
    router.push({
      pathname: '/'
    });

    // Close cart window
    closeCart();
  };

  return (
    <CartStyles open={cartOpen}>
      <header>
        <CloseButton onClick={toggleCart} title="close">
          &times;
        </CloseButton>
        {!hasGuestPerms && (<Supreme>{me.name}</Supreme>)}
        {hasGuestPerms && !hasGuestEmail && (<Supreme>{me.name != 'Guest User' ? me.name : email[0]}</Supreme>)}
        {hasGuestPerms && hasGuestEmail && (<Supreme>Cart</Supreme>)}
        <p>
          You have {cartCount === 0 ? 'no' : cartCount} item{cartCount > 1 || cartCount === 0 ? 's' : ''} in your cart.
        </p>
      </header>
      <ul>{me.cart.map(cartItem => <CartItem key={cartItem.id} cartItem={cartItem} />)}</ul>
      <footer>
        <table width="100%" border="0">
          <tbody>
          <tr>
            <td>Shipping: </td>
            <td align="right">Free </td>
          </tr>
          <tr>
            <td valign="top">Total: {cartCount < 1 ? '' : '(Price incl. VAT)'}</td>
            <td valign="top" align="right">{formatMoney(calcTotalPrice(me.cart))}</td>
          </tr>
          <tr>
            <td colSpan="2">               
            </td>
          </tr>
          </tbody>
        </table>
      </footer>
      <buttonfooter>
        {(me.cart.length >= 1 && calcTotalPrice(me.cart) !== 0 && ((!hasGuestPerms || (hasGuestPerms && !hasGuestEmail)) && addressExists === true)) && (
          <TakeMyMoney/>
        )}
        {(me.cart.length >= 1 && calcTotalPrice(me.cart) !== 0 && ((hasGuestPerms && hasGuestEmail) || (!hasGuestEmail && addressExists === false))) && (
          <SickButton loggedout disabled={user.loading} onClick={signIn} background={user.loading ? props => props.theme.grey : props => props.theme.blue}>Pay</SickButton>
        )}
        {(me.cart.length === 0 || calcTotalPrice(me.cart) === 0) && (
          <SickButton onClick={addItemsToCart} background={props => props.theme.grey}>Pay</SickButton>
        )}
      </buttonfooter>  
    </CartStyles>
  );
};

export default memo(Cart);

