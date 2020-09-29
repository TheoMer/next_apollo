import React, { memo, useEffect } from 'react';

const DeleteItemLoggedOut = props => {
  const {urlReferer} = props;
  
  /*useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) {
      props.subscribeToDeleteItems()
    }
    // Clean up info taken from: https://juliangaramendy.dev/use-promise-subscription/
    return () => {
      isSubscribed = false
    };
  },[urlReferer]);*/

  return (
    null
  );
}

export default memo(DeleteItemLoggedOut);
