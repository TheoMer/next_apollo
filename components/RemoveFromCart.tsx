import React, { memo } from 'react';
import { gql, useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import { CURRENT_USER_QUERY } from './User';
import { useCart } from './LocalState';
import { BigButton } from './styles/BigButton';

interface RemoveFromCartData {
  id: string;
  __typename: string; // This __typename refers to cartItem
}

interface RemoveFromCartVariables {
  id: string;
  itemId: string
}

const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: String!, $itemId: String!) {
    removeFromCart(id: $id, itemId: $itemId) {
      id
    }
  }
`;

const RemoveFromCart = ({ id, itemId, loadingFromCartItem }) => {
  //const { id, itemId, loadingFromCartItem } = props;

  // This holds the loading state (loadingToCartFunc) of an item added to the cart in AddToCartVariantOrder.js
  const { loadingToCart } = useCart();

  //This gets called as soon as we get a response back from the server 
  // after a mutation has been performed
  const updateCart = (cache, payload) => {
    // 1. first read the cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    // 2. remove that item from the cart
    const cartItemId = payload.data.removeFromCart.id;
    const updatedCart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);
    // 3. write it back to the cache
    //cache.writeQuery({ query: CURRENT_USER_QUERY, data });
    cache.writeQuery({
      query: CURRENT_USER_QUERY,
      data: {
        ...data,
        me: {
          ...data.me,
          cart: updatedCart
        }
      }
    });
  };

  //Remove From cart Mutation
  const [removeFromCart, { loading }] = useMutation<
  { removeFromCart: RemoveFromCartData, __typename: string }, // This __typename refers to Mutation 
  RemoveFromCartVariables
  >(REMOVE_FROM_CART_MUTATION, {
    variables: { id, itemId },
    update: updateCart,
    optimisticResponse: {
      __typename: 'Mutation',
      removeFromCart: {
        __typename: 'CartItem',
        id
      }
    }
  });

  return (

    <BigButton
      disabled={loading}
      onClick={() => {
        loadingToCart || loadingFromCartItem ? null : removeFromCart().catch(err => alert(err.message));
      }}
      title= {loadingToCart || loadingFromCartItem ? "Item being added to cart" : "Delete Item"}
      itemLoading={loadingToCart || loadingFromCartItem ? true : false}
    >
      &times;
    </BigButton>

  );
}

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired
};

export default memo(RemoveFromCart);
export { REMOVE_FROM_CART_MUTATION };
