import React, { memo } from 'react';
import { gql, useMutation  } from '@apollo/client';
import Link from 'next/link';
import { TOGGLE_CART_OPEN_MUTATION } from './Cart';
import { CURRENT_USER_QUERY } from './User';
import { ALL_ITEMS_QUERY } from './Items';

const ADD_TO_CART_MUTATION = gql`
  mutation addToCart($id: String!) {
    addToCart(id: $id) {
      id
      quantity
      itemvariants {
        id
        price
        image
        largeImage
        title
        description
        mainDescription
        quantity
        color {
          id
          name
          label
        }
        size {
          id
          name
          label
        }
        item {
          id
          price
          image
          largeImage
          title
          description
          mainDescription
          quantity
          color {
            id
            name
            label
          }
          size {
            id
            name
            label
          }
          itemvariants {
            id
          }
        }
      }
      item {
        id
        price
        image
        largeImage
        title
        description
        mainDescription
        quantity
        color {
          id
          name
          label
        }
        size {
          id
          name
          label
        }
        itemvariants {
          id
          price
          image
          largeImage
          title
          description
          mainDescription
          quantity
          color {
            id
            name
            label
          }
          size {
            id
            name
            label
          }
          item {
            id
          }
        }
      }
    }
  }
`;

const AddToCart = props => {

  const update = (cache, payload) => {
    // console.log('Running add to cart update fn');
    // 1. Read the cache and make a copy
    const data = cache.readQuery({
      query: CURRENT_USER_QUERY
    });

    // 2. payload comes with the cartItem that is added. Check if there are existing items inside data.me.cart then increase quantity else create new cartItem
    // console.log('me', data.me);
    // console.log('payload.data', payload.data);
    const { cart } = data.me;
    if (payload.data.addToCart.id.startsWith('-')) {
      // payload comes from optimistic response because of negative random number
      // check if item in payload exists inside of cart (not the cartItem.id but the actual item.id). if it does then increase cartItem quantity by 1 else create new cartItem
      const payloadItemId = payload.data.addToCart.item.id;

      // there should only be one unique cartItem that should match. If this is empty means cartItem doesn't exist
      const existingCartItemIndex = cart.findIndex(
        cartItem => cartItem.item.id === payloadItemId
      );

      // if findIndex returns -1 means cartItem is not inside of cart
      if (existingCartItemIndex === -1) {
        cart.push(payload.data.addToCart);
      } else {
        // Only increment the cart item count of an item if it is <= the quantity of that item available
        //console.log('cart item quantity ', cart[existingCartItemIndex].item.quantity)
        //cart[existingCartItemIndex].quantity += 1;
        cart[existingCartItemIndex].quantity < cart[existingCartItemIndex].item.quantity ? cart[existingCartItemIndex].quantity += 1 : alert(`Only ${cart[existingCartItemIndex].item.quantity} of the ${cart[existingCartItemIndex].item.title} ${cart[existingCartItemIndex].item.quantity === 1 ? 'is' : 'are'} available for purchase.`)
      }

      //console.log('me2', data.me);
      // write data to cache
      cache.writeQuery({
        query: CURRENT_USER_QUERY,
        data
      });
    } else {
      // payload comes from server response. If cartItem exists remove it from cart and replace it with the new cartItem in case details changed, otherwise push new cartItem into cart
      const payloadCartItemId = payload.data.addToCart.id;
      const matchingCartItemIndex = cart.findIndex(
        cartItem => cartItem.id === payloadCartItemId
      );

      // if findIndex returns -1 means cartItem is not inside of cart
      if (matchingCartItemIndex === -1) {
        cart.push(payload.data.addToCart);
      } else {
        cart.splice(matchingCartItemIndex, 1, payload.data.addToCart); // replace existing cartItem with payload's cartItem to retain position inside of array
      }

      // cart.length === 0 && cart.push(payload.data.addToCart);
      //console.log('me3', data.me);
      cache.writeQuery({
        query: CURRENT_USER_QUERY,
        data
      });
    }
  };

  const { id, itemDetails } = props;

  // ADD_TO_CART_MUTATION
  const [addToCart, { loading: loadingAddToCart, error: errorAddToCart }] = useMutation(ADD_TO_CART_MUTATION, {
    variables: { id },
    update: update,
    optimisticResponse: {
      __typename: "Mutation",
      addItemVariantsToCart: {
        __typename: 'Mutation',
        addToCart: {
          __typename: 'CartItem',
          id: Math.round(Math.random() * -1000000).toString(),
          quantity: 1,
          item: { 
            ...itemDetails
          },
          // This itemvariants here is dummy imfo not actioned upon. 
          // If it's not added, when an item is added to cart, it breaks
          // the cart window (disappears/reappers) and dev logs list 
          // 'Missing field ItemVariants in...'
          itemvariants: {
            __typename: 'ItemVariants',
            ...itemDetails,
            item: {
              __typename: 'Item',
              ...itemDetails
            }
          }
        }
      },
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY }, { query: ALL_ITEMS_QUERY }]
  });

  // Determine whether the item quantity is still in stock. 
  var cartButton;
  // var quantity = itemDetails.quantity;
  // The sum total of variant items available for purchase.
  let quantity = itemDetails.itemvariants.reduce((a, variant) => a + variant.quantity, 0);

  if (quantity >= 1) {

    // This is now just a link to the greater info/variant options page
    /*cartButton = (
      <Mutation mutation={TOGGLE_CART_OPEN_MUTATION}>
        {(toggleCartOpen) => (
          <button disabled={loading} onClick={() => {
            addToCart().catch(err => alert(err.message));
            toggleCartOpen().catch(err => console.log(err.message));
          }}>
            Add{loading && 'ing'} To Cart 🛒
          </button>
        )}
      </Mutation>
    )*/
    cartButton = (
      <Link 
        href={{
          pathname: '/item',
          query: { id }
        }}
      >
        <a>Add{loadingAddToCart && 'ing'} To Cart 🛒</a>
      </Link>
    )
  } else {
    cartButton = (
      <button>
        Out of Stock 🛒
      </button>
    )
  }

  return (
    cartButton
  )
};

export default memo(AddToCart);
export { ADD_TO_CART_MUTATION };
