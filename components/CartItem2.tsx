import React, { FC, memo, useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import formatMoney from '../lib/formatMoney';
import RemoveFromCart from './RemoveFromCart';
import { CURRENT_USER_QUERY } from './User';
import CartQuantityButton from './styles/CartQuantityButton';
import { useCart } from './LocalState';

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
    pointer-events: none; /* Removes the "save image" context */
  }
  h3,
  p {
    margin: 0;
  }
  a:hover {
    cursor:pointer;
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
      border-color: ${props => props.theme.blue};
    }
  }
`;

interface Color {
  __typename: string;
  id: string;
  name: string;
  label: string;
}

interface Size {
  __typename: string;
  id: string;
  name: string;
  label: string;
}

interface Item {
  __typename: string;
  id: string;
  price: number;
  image: string;
  largeImage: string;
  title: string;
  description: string;
  mainDescription: string;
  quantity: number;
  Color: Color;
  Size: Size;
  itemvariants: {
    __typename: string;
    id: string;
    price: number;
    image: string;
    largeImage: string;
    title: string;
    description: string;
    mainDescription: string;
    quantity: number;
    Color: Color;
    Size: Size;
    item: string;
  }
}

interface ItemVariants {
  __typename: string;
  id: string;
  price: number;
  image: string;
  largeImage: string;
  title: string;
  description: string;
  mainDescription: string;
  quantity: number;
  Color: Color;
  Size: Size;
  item: string;
}

interface updatCartItemData {
  __typename: string;
  id: string;
  quantity: number;
  ItemVariants: ItemVariants;
  Item: Item;
}

interface updatCartItemVariables {
  id: string;
  quantity: number;
}

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
        largeImage
        title
        description
        mainDescription
        quantity
        Color {
          id
          name
          label
        }
        Size {
          id
          name
          label
        }
        Item {
          id
          price
          image
          largeImage
          title
          description
          mainDescription
          quantity
          Color {
            id
            name
            label
          }
          Size {
            id
            name
            label
          }
          itemvariants {
            id
          }
        }
      }
      Item {
        id
        price
        image
        largeImage
        title
        description
        mainDescription
        quantity
        Color {
          id
          name
          label
        }
        Size {
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
          Color {
            id
            name
            label
          }
          Size {
            id
            name
            label
          }
          item
        }
      }
    }
  }
`;

const CartItem2 = ({ cartItem }) => {
    const router = useRouter();
    const [quantity, setQuantity] = useState();
    const { closeCart } = useCart();
    const update2 = (cache, payload) => {
        // 1. read the cache and make a copy
        const data = cache.readQuery({
            query: CURRENT_USER_QUERY
        });
  
        // 2. payload comes with the cartItem that is added. Check if there are existing items inside data.me.cart then increase quantity else create new cartItem
        // console.log('cartItem2 me', data.me);
        //console.log('payload.data', payload.data);
        const { cart } = data.me;

        // Because cart is not extensible it needs to be copied to a new object
        // so that it can be updated
        let newCartClone = cart.map((item) => 
            Object.assign({}, item)
        );

        if (payload.data.updateCartItem.id.startsWith('-')) {
          // payload comes from optimistic response because of negative random number
          // check if item in payload exists inside of cart (not the cartItem.id but the actual item.id). if it does then increase cartItem quantity by 1 else create new cartItem
          const payloadItemId = payload.data.updateCartItem.ItemVariants.id;
          
          // there should only be one unique cartItem that should match. If this is empty means cartItem doesn't exist
          const existingCartItemIndex = cart.findIndex(
            cartItem => cartItem.ItemVariants.id === payloadItemId
          );
    
          // Update cart quantity value
          newCartClone[existingCartItemIndex].quantity = parseInt(payload.data.updateCartItem.quantity);
    
          // console.log('me2', data.me);
          // write data to cache
          
          /*cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data,
          });*/

          cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data: {
              ...data,
              me: {
                ...data.me,
                cart: newCartClone
              }
            }
          });
          
        } else {
          
          // payload comes from server response. If cartItem exists remove it from cart and replace it with the new cartItem in case details changed, otherwise push new cartItem into cart
          const payloadCartItemId = payload.data.updateCartItem.id;
          const matchingCartItemIndex = cart.findIndex(
            cartItem => cartItem.id === payloadCartItemId
          );
    
          // if findIndex returns -1 means cartItem is not inside of cart
          if (matchingCartItemIndex === -1) {
            newCartClone.push(payload.data.updateCartItem);
          } else {
            newCartClone.splice(matchingCartItemIndex, 1, payload.data.updateCartItem); // replace existing cartItem with payload's cartItem to retain position inside of array
          }
    
          // cart.length === 0 && cart.push(payload.data.addToCart);
          // console.log('me3', data.me);
          
          /*cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data,
          });*/
          cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data: {
              ...data,
              me: {
                ...data.me,
                cart: newCartClone
              }
            }
          });
        }
    };

    const updateCartItem2 = async (e, updateCartItemMutation) => {
      e.preventDefault();

      try {

        const res = await updateCartItemMutation({
          variables: {
            id: cartItem.id,
            quantity: parseInt(quantity)
          },
          // 1. write optimisticresponse
          optimisticResponse: {
            __typeName: 'Mutation',
            updateCartItem: {
              __typename: 'CartItem',
              id: Math.round(Math.random() * -1000000).toString(),
              quantity: parseInt(quantity),
              Item: {
                __typename: 'Item', 
                ...cartItem.item
              },
              ItemVariants: {
                __typename: 'ItemVariants', 
                id: cartItem.ItemVariants.id,
                price: cartItem.ItemVariants.price,
                image: cartItem.ItemVariants.image,
                largeImage: cartItem.ItemVariants.largeImage,
                title: cartItem.ItemVariants.title,
                description: cartItem.ItemVariants.description,
                mainDescription: cartItem.ItemVariants.mainDescription,
                quantity: parseInt(cartItem.ItemVariants.quantity),
                Color: cartItem.ItemVariants.color,
                Size: cartItem.ItemVariants.size, 
                /*Item: {
                  __typename: 'Item',
                  ...cartItem.item
                }*/
                item: cartItem.ItemVariants.item
              }
            }
          },
          // 2. write update function
          update: update2,
        });
        
      } catch (err) {
        return err;
      }
    };

    //const { cartItem } = props;

    const href = `/item?id=${cartItem.Item.id}`;

    const showItem = () => {
      //e.preventDefault()
      router.push(href);
    }
    
    // How to refector componentDidUpdate in cartItem2_OLD in useEffect, taken from here:
    // https://stackoverflow.com/questions/55971005/useeffect-howto-refactor-componetdidupdate/55971146#55971146
    useEffect(() => {
      setQuantity(parseInt(cartItem.quantity) as any);
      //Prefetch url
      router.prefetch(href);
    }, [cartItem]);

    // Update Cart Item Mutation
    const [ updateCartItem, { loading, error } ] = useMutation<
      { updateCartItem: updatCartItemData, __typeName: string},
      updatCartItemVariables>(
      UPDATE_CART_ITEM_MUTATION,
      { 
        variables: {  
          id: cartItem.id,
          quantity: parseInt(quantity)
        } 
      }
    );

    return (
      <>
      <CartItemStyles>
          <a onClick={() => {closeCart(); setTimeout(() => showItem(), 275);}}>
            <img width="100" src={cartItem.ItemVariants.image} alt={cartItem.ItemVariants.title} />
          </a>

        <div className="cart-item-details">
          <h3>
          <a onClick={() => {closeCart(); setTimeout(() => showItem(), 275);}}>
            {cartItem.ItemVariants.title}
          </a>        
          </h3>(Size: {cartItem.ItemVariants.Size.label} / Colour: {cartItem.ItemVariants.Color.label})

          <Form2 key={cartItem.id} onSubmit={e => updateCartItem2(e, updateCartItem)}>
            <Error error={error} page="" />
            <p/>
            <table width="100%" cellPadding="0">
                <tbody>
                <tr>
                  <td valign="top" width="7.3%"> {/* Was formally 15.3% */}
                  <label htmlFor="quantity">
                  <input
                    type="number"
                    id={`quantity-${cartItem.ItemVariants.id}`}
                    name={`quantity-${cartItem.ItemVariants.id}`}
                    placeholder="Quantity"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value as any)}
                    min="1"
                    max={cartItem.ItemVariants.quantity}
                  />
                  </label>
                  </td>
                  <td width="5%" valign="top" align="center">&times;</td>
                  <td valign="top" width="3.3%" align="center"><em> {formatMoney(cartItem.ItemVariants.price)}</em></td>
                  <td valign="top" width="5.3%" align="center"><em>{'= '}</em></td>
                  <td valign="top" width="15.3%"><em>{formatMoney(cartItem.ItemVariants.price * cartItem.quantity)}</em></td>
                </tr>
                <tr>
                  <td valign="top" colSpan={4}><CartQuantityButton disabled={loading} background={loading ? props => props.theme.grey : props => props.theme.blue} type="submit">Updat{loading ? 'ing' : 'e'}</CartQuantityButton></td>
                </tr>
                </tbody>
            </table>
          </Form2>

        </div>
        <RemoveFromCart id={cartItem.id} itemId={cartItem.ItemVariants.id} loadingFromCartItem={loading} />
      </CartItemStyles>
      </>
    );
}

CartItem2.propTypes = {
    cartItem: PropTypes.object.isRequired,
    quantity: PropTypes.number,
};

export default memo(CartItem2);
