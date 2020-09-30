import React, { memo, useState } from 'react';
import { Mutation } from '@apollo/client/react/components';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import formatMoney from '../lib/formatMoney';
import RemoveFromCart from './RemoveFromCart';
import { CURRENT_USER_QUERY } from './User';
import CartQuantityButton from './styles/CartQuantityButton';

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`;

const Form2 = styled.form`
  box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.05);
  background: rgba(0, 0, 0, 0.02);
  border: 0px solid white;
  padding: 0px;
  font-size: 1.5rem;
  line-height: 1.5;
  font-weight: 600;
  label {
    display: block;
    margin-bottom: 1rem;
  }
  input,
  select {
    width: 100%;
    padding: 0.5rem;
    font-size: 1.2rem;
    border: 1px solid black;
    &:focus {
      outline: 0;
      border-color: ${props => props.theme.red};
    }
  }
`;

// Mutation 
const UPDATE_CART_ITEM_MUTATION = gql`
  mutation UPDATE_CART_ITEM_MUTATION($id: String!, $quantity: Int) {
    updateCartItem(id: $id, quantity: $quantity) {
        id
        quantity
        ItemVariants {
            id
            price
            image
            title
            description
            mainDescription
            quantity
            Color {
                name
                label
            }
            Size {
                name
                label
            }
        }
    }
  }
`;

const CartItemVariants = props => {
    const [quantity, setQuantity] = useState(1);

    const update2 = (cache, payload) => {
    // 1. read the cache and make a copy
        const data = cache.readQuery({
            query: CURRENT_USER_QUERY
        });
  
      // 2. payload comes with the cartItem that is added. Check if there are existing items inside data.me.cart then increase quantity else create new cartItem
        // console.log('cartItem2 me', data.me);
        //console.log('payload.data', payload.data);
        const { cart } = data.me;
        if (payload.data.updateCartItem.id.startsWith('-')) {
          // payload comes from optimistic response because of negative random number
          // check if item in payload exists inside of cart (not the cartItem.id but the actual item.id). if it does then increase cartItem quantity by 1 else create new cartItem
          const payloadItemId = payload.data.updateCartItem.itemvariants.id;
          
          // there should only be one unique cartItem that should match. If this is empty means cartItem doesn't exist
          const existingCartItemIndex = cart.findIndex(
            cartItem => cartItem.itemvariants.id === payloadItemId
          );
    
          // Update cart quantity value
          cart[existingCartItemIndex].quantity = payload.data.updateCartItem.quantity;
    
          //console.log('me2', data.me);
          // write data to cache
          
          cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data
          });
          
        } else {
          
          // payload comes from server response. If cartItem exists remove it from cart and replace it with the new cartItem in case details changed, otherwise push new cartItem into cart
          const payloadCartItemId = payload.data.updateCartItem.id;
          const matchingCartItemIndex = cart.findIndex(
            cartItem => cartItem.id === payloadCartItemId
          );
    
          // if findIndex returns -1 means cartItem is not inside of cart
          if (matchingCartItemIndex === -1) {
            cart.push(payload.data.updateCartItem);
          } else {
            cart.splice(matchingCartItemIndex, 1, payload.data.updateCartItem); // replace existing cartItem with payload's cartItem to retain position inside of array
          }
    
          // cart.length === 0 && cart.push(payload.data.addToCart);
          // console.log('me3', data.me);
          
          cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data
          });
        }
    };
    const updateCartItem = async (e, updateCartItemMutation) => {

      e.preventDefault();
      try {

        const res = await updateCartItemMutation({
          variables: {
            id: props.cartItem.id,
            quantity
          },
          // 1. write optimisticresponse
          optimisticResponse: {
              __typeName: 'Mutation',
              updateCartItem: {
                __typename: 'CartItem',
                id: Math.round(Math.random() * -1000000).toString(),
                quantity,
                itemvariants: { ...props.cartItem.itemvariants }
              }
          },
          // 2. write update function
          update: update2,
        });

      } catch (err) {

        return err;

      }
    };
    
    useEffect(() => {
      setQuantity(quantity);
    });
    
    const { cartItem, client } = props;

    return (
        <CartItemStyles>
            <img width="100" src={cartItem.itemvariants.image} alt={cartItem.itemvariants.title} />
            <div className="cart-item-details">
            <h3>{cartItem.itemvariants.title}</h3>
            <Mutation 
                mutation={UPDATE_CART_ITEM_MUTATION} 
                variables={{
                  id: cartItem.itemvariants.id,
                  quantity,
                }}
            >
                {(updateCartItem, { loading, error }) => {
                return (
                    <Form2 key={cartItem.id} onSubmit={e => updateCartItem(e, updateCartItem)}>
                    <Error error={error} />
                    <p/>
                    <table width="100%" border="0" cellPadding="0">
                        <tbody>
                        <tr>
                            <td valign="top" width="15.3%"><em>{formatMoney(cartItem.itemvariants.price * cartItem.quantity)}</em></td>
                            <td valign="top" width="5.3%"><em>{' - '}</em></td>
                            <td valign="top" width="15.3%">
                            <label htmlFor="quantity">
                            <input
                                type="number"
                                id={`quantity-${cartItem.itemvariants.id}`}
                                name={`quantity-${cartItem.itemvariants.id}`}
                                placeholder="Quantity"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                                max={props.cartItem.itemvariants.quantity}
                            />
                            </label>
                            </td>
                            <td width="1.5%"></td>
                            <td valign="top" margin="50px" width="33.3%"><em>&times;111 {formatMoney(cartItem.itemvariants.price)}</em></td>
                        </tr>
                        <tr>
                            <td valign="top" colSpan="4"><CartQuantityButton disabled={loading} background={loading ? 'grey' : 'red'} type="submit">Updat{loading ? 'ing' : 'e'}</CartQuantityButton></td>
                        </tr>
                        </tbody>
                    </table>
                    </Form2>
                )
                }}
            </Mutation>
            </div>
        <RemoveFromCart id={cartItem.id} itemId={cartItem.itemvariants.id} />
      </CartItemStyles>
    );
}

CartItemVariants.propTypes = {
    cartItem: PropTypes.object.isRequired,
    quantity: PropTypes.number,
};

export default memo(CartItemVariants);
