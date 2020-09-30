import React, { memo } from 'react';
import Link from 'next/link';

const AddToCart = ({ id, itemDetails }) => {

  // Determine whether the item quantity is still in stock. 
  var cartButton;

  // The sum total of variant items available for purchase.
  let quantity = itemDetails.itemvariants.reduce((a, variant) => a + variant.quantity, 0);

  if (quantity >= 1) {
    cartButton = (
      <Link 
        href={{
          pathname: '/item',
          query: { id }
        }}
      >
        <a>Add To Cart 🛒</a>
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
