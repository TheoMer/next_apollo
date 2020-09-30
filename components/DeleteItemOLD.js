import React, { memo } from 'react';
import { gql, useMutation  } from '@apollo/client';
import { ALL_ITEMS_QUERY } from './Items';
import { CURRENT_USER_QUERY } from './User';

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: String!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

const DeleteItem = props => {
  const {urlReferer} = props;
  const update = (cache, payload) => {
    cache.evict(`Item:${payload.data.deleteItem.id}`);
    // Manually update the cache on the client, so it matches the server
    // 1. Read the cache for the items we want
    //const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    // 2. Filter the deleted itemout of the page
    //data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
    // 3. Put the items back!
    //cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  };

  /*useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) {
      props.subscribeToDeleteItems()
    }
    // Cleaup info taken from: https://juliangaramendy.dev/use-promise-subscription/
    return () => {
      isSubscribed = false
    };
  },[urlReferer]);*/

  // Delete Item Mutation
  const [deleteItem, { error: errorDeleteItem, loading: loadingDeleteItem }] = useMutation(DELETE_ITEM_MUTATION, {
    variables: {
      id: props.id,
    },
    update: update,
    optimisticResponse: {
      __typename: "Mutation",
      addItemVariantsToCart: {
        __typename: "Mutation",
        deleteItem: {
          __typename: 'Item',
          id: props.id
        }
      }
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY, variables: {} }]
  });

  return (
    <button
      onClick={() => {
        if (confirm('Are you sure you want to delete this item?')) {
          deleteItem().catch(err => {
            alert(err.message);
          });
        }
      }}
    >
      {props.children}
    </button>
  );
}

export default memo(DeleteItem);
