import React, { memo, useEffect }  from 'react';
import { useCart } from './LocalState';

const MutationOnMount =  props => {
  const { onToken } = props
  const { closeCart } = useCart();

  useEffect(() => {
    if (onToken) {
      closeCart();
    }
  }, [onToken]);

  return (
      null
  );
}

export default memo(MutationOnMount);
