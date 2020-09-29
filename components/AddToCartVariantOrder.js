import React, { memo, useState, useEffect } from 'react';
import { gql, useMutation  } from '@apollo/client';
import styled from 'styled-components';
import { CURRENT_USER_QUERY } from './User';
import SingleItemSickButton from './styles/SingleItemSickButton';
import { useCart } from './LocalState';
import formatMoney from '../lib/formatMoney';

const Form = styled.form`
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
    padding: 0.9rem; /*Was formally 0.5 */
    font-size: 1.5rem; /* Was formally 1.2 */
    border: 1px solid black;
    &:focus {
      outline: 0;
      border-color: ${props => props.theme.blue};
    }
  }
  fieldset { border:0px }
`;

const ADD_TO_CART_VARIANTS_MUTATION = gql`
  mutation addItemVariantsToCart($id: String!) {
    addItemVariantsToCart(id: $id) {
      id
      quantity
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
        item
      }
    }
  }
`;

const AddToCartVariantOrder = props => {
  const [variant, setVariant] = useState('');

  const handleChange = e => {
    const { name, type, value } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setVariant(val);
    const imageVal = e.target.options[e.target.selectedIndex].dataset;

    props.callbackFromParent(
      imageVal.smallimage, 
      imageVal.largeimage,
      imageVal.smallimage2, 
      imageVal.largeimage2,
      imageVal.smallimage3, 
      imageVal.largeimage3,
      imageVal.smallimage4, 
      imageVal.largeimage4,
      imageVal.smallimage5, 
      imageVal.largeimage5,
      imageVal.smallimage6, 
      imageVal.largeimage6
    ); //Send selected image back to parent (SingleItem.js)
  };

  const update = (cache, payload) => {

    // NOTE: To change the order in which items are shown in the cart, order confirmation, and email to asc
    // 1. Change unshift (desc) to push (asc)
    // 2. Change the cart order in components/User.js to asc
    // 3. Change the cart order in backend/types/Mutations.ts (t.field('createOrder')) to asc
    
    // 1. read the cache and make a copy
    const data = cache.readQuery({
      query: CURRENT_USER_QUERY
    });
   
    // 2. payload comes with the cartItem that is added. Check if there are existing items inside data.me.cart then increase quantity else create new cartItem
    const { cart } = data.me;

    // Because cart is not extensible it needs to be copied to a new object
    // so that it can be updated
    let newCartClone = cart.map((item) => 
        Object.assign({}, item)
    );

    if (payload.data.addItemVariantsToCart.id.startsWith('-')) {
      
      // payload comes from optimistic response because of negative random number
      // check if item in payload exists inside of cart (not the cartItem.id but the actual item.id). if it does then increase cartItem quantity by 1 else create new cartItem
      const payloadItemId = payload.data.addItemVariantsToCart.ItemVariants.id;
      
      // there should only be one unique cartItem that should match. If this is empty means cartItem doesn't exist
      const existingCartItemIndex = cart.findIndex(
        cartItem => cartItem.ItemVariants.id === payloadItemId
      );

      // if findIndex returns -1 means cartItem is not inside of cart
      if (existingCartItemIndex === -1) {

        newCartClone.unshift(payload.data.addItemVariantsToCart);

      } else {

        // Only increment the cart item count of an item if it is <= the quantity of that item available
        cart[existingCartItemIndex].quantity < cart[existingCartItemIndex].ItemVariants.quantity ? newCartClone[existingCartItemIndex].quantity += 1 : alert(`Only ${cart[existingCartItemIndex].itemvariants.quantity} of the ${cart[existingCartItemIndex].itemvariants.title} ${cart[existingCartItemIndex].itemvariants.quantity === 1 ? 'is' : 'are'} available for purchase.`)
      }

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
      const payloadCartItemId = payload.data.addItemVariantsToCart.id;
      const matchingCartItemIndex = cart.findIndex(
        cartItem => cartItem.id === payloadCartItemId
      );

      // if findIndex returns -1 means cartItem is not inside of cart
      if (matchingCartItemIndex === -1) {
        newCartClone.unshift(payload.data.addItemVariantsToCart);
      } else {
        newCartClone.splice(matchingCartItemIndex, 1, payload.data.addItemVariantsToCart); // replace existing cartItem with payload's cartItem to retain position inside of array
      }

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

  const { id, itemDetails, client } = props;
  const index = itemDetails.itemvariants.findIndex(x => x.id === variant);

  const { openCart, loadingToCartFunc } = useCart();

  useEffect(() => {
    setVariant('');
  }, [id]);

  // ADD TO CART VARIANTS MUTATION
  const [addItemVariantsToCart, { loading, error }] = useMutation(ADD_TO_CART_VARIANTS_MUTATION, {
    variables: { id: variant },
    update: update,
    optimisticResponse: {
      __typename: "Mutation",
      addItemVariantsToCart: {
        __typename: 'CartItem',
        id: Math.round(Math.random() * -1000000).toString(),
        quantity: 1,
        Item: {
          __typename: 'Item', 
          ...itemDetails
        },
        ItemVariants: {
          __typename: 'ItemVariants', 
          id: variant,
          price: index === -1? itemDetails.price : itemDetails.itemvariants[index].price,
          title: index === -1? itemDetails.title : itemDetails.itemvariants[index].title,
          description: index === -1? itemDetails.description : itemDetails.itemvariants[index].description,
          mainDescription: index === -1? itemDetails.mainDescription : itemDetails.itemvariants[index].mainDescription,
          quantity: index === -1? itemDetails.quantity : itemDetails.itemvariants[index].quantity,
          image: index === -1? itemDetails.image : itemDetails.itemvariants[index].image,
          largeImage: index === -1? itemDetails.largeImage : itemDetails.itemvariants[index].largeImage,
          Color: index === -1? itemDetails.color : itemDetails.itemvariants[index].color,
          Size: index === -1? itemDetails.size : itemDetails.itemvariants[index].size, 
          Item: {
            __typename: 'Item',
            ...itemDetails
          }
        },
      },
    },
  });

  // Determine whether the item quantity is still in stock. 
  let cartButton;
  let selectOption;
  // var quantity = itemDetails.quantity;
  // The sum total of variant items available for purchase.

  let quantity = itemDetails.itemvariants.reduce((a, variant) => a + variant.quantity, 0);

  if (quantity >= 1 && variant != '') {
    // This is set so that an item cannot be deleted (RemoveFromCart.js) from the cart while data is 
    // still in transit from the database
    loadingToCartFunc(loading);

    cartButton = (
      <SingleItemSickButton type="button" background={props => loading ? props.theme.grey : props.theme.blue} disabled={loading} onClick={() => {
        addItemVariantsToCart().catch(err => 
          err.message === "GraphQL error: Please register/login to begin purchasing items." ? 
          alert("Please register/login to begin purchasing items.") : console.log(err.message)
        );
        // toggleCartOpen().catch(err => console.log(err.message));
        setTimeout(() => { openCart() }, 750); // 1 second 1000
      }}>
          Add{loading && 'ing'} to Cart
      </SingleItemSickButton>
    )
  } else if (quantity >= 1 && variant === '') { 
    cartButton = (
      <SingleItemSickButton type="button" background={props => props.theme.grey}>
          Select a Product
      </SingleItemSickButton>
    )
  }
  else {
    cartButton = (
      <SingleItemSickButton type="button" background={props => props.theme.grey}>
          Out of Stock
      </SingleItemSickButton>
    )
  }

  return (
    <Form>
      <table border="0" width="100%" cellPadding="0" cellSpacing="0" cellPadding="0">
        <tbody>
          <tr>
            <td width="51.5%" align="left" valign="top">
              <fieldset disabled={loading} aria-busy={loading} border="0">
                <label htmlFor="variant">
                  <select
                    type="string"
                    id="variant"
                    name="variant"
                    placeholder="Select a Product"
                    value={variant} 
                    onChange={handleChange}
                    required
                  >
                    <option 
                    value="" 
                    data-smallimage="" 
                    data-largeimage=""
                    data-smallimage2="" 
                    data-largeimage2=""
                    data-smallimage3="" 
                    data-largeimage3=""
                    data-smallimage4="" 
                    data-largeimage4=""
                    data-smallimage5="" 
                    data-largeimage5=""
                    data-smallimage6="" 
                    data-largeimage6=""
                    >Select Size & Colour</option>
                    {itemDetails.itemvariants.map(opt => {
                      if (opt.quantity >= 1) {
                        selectOption = (
                          <option
                            key={opt.id}
                            value={opt.id} 
                            data-smallimage={opt.image} 
                            data-largeimage={opt.largeImage}
                            data-smallimage2={opt.image2} 
                            data-largeimage2={opt.largeImage2}
                            data-smallimage3={opt.image3} 
                            data-largeimage3={opt.largeImage3}
                            data-smallimage4={opt.image4} 
                            data-largeimage4={opt.largeImage4}
                            data-smallimage5={opt.image5} 
                            data-largeimage5={opt.largeImage5}
                            data-smallimage6={opt.image6} 
                            data-largeimage6={opt.largeImage6}
                          >{opt.Size.label + ` (${opt.Color.label}) `} { (opt.quantity <= 10 && opt.quantity !== 0) && `- (${opt.quantity} in stock) ` } { (opt.price != itemDetails.price) && `- New Price: ${formatMoney(opt.price)}` }
                          </option>
                        )
                      } else if (opt.quantity === 0) {
                        selectOption = (
                          <option
                            disabled
                            key={opt.id}
                            value={opt.id}>{opt.Size.label + ` (${opt.Color.label}) `} { (opt.quantity === 0) && `- (Out of Stock)` }
                          </option>
                        )
                      }
                      return (
                        selectOption
                      );
                    }
                    )}
                  </select>
                </label>
              </fieldset>                 
            </td>
            <td valign="top">{cartButton}</td>
          </tr>
        </tbody>
      </table>
    </Form>
  )
}

export default memo(AddToCartVariantOrder);
export { ADD_TO_CART_VARIANTS_MUTATION };
