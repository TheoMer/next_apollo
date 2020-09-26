import React, { memo } from 'react';
import { gql, useQuery } from '@apollo/client';
import styled from 'styled-components';
import Pagination from './Pagination';
import { perPage } from '../config';
//import { useCart } from './LocalState';
import IpBrowserDetails from './IpBrowserDetails';
import { useUser } from './User';
import ItemsListItems from './ItemsListItems';
import { useClient } from '../lib/Client';
import Error from './ErrorMessage';

interface Size {
  id: string;
  name: string;
  label: string;
}

interface Color {
  id: string;
  name: string;
  label: string;
}

interface User {
  id: string;
}

interface ItemVariants {
  id: string;
  title: string;
  price: number;
  description:  string;
  mainDescription: string;
  image: string;
  largeImage: string;
  quantity: number;
  Color: Color;
  Size: Size;
  User: User;
  item: string;
}

interface Item {
  id: string;
  title: string;
  price: number;
  description:  string;
  mainDescription: string;
  image: string;
  largeImage: string;
  quantity: number;
  Color: Color;
  Size: Size;
  User: User;
  itemvariants: ItemVariants[]
}

// Taken from: https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/pagination#do-i-always-have-to-skip-1
// Do I always have to skip: 1?
// If you do not skip: 1, your result set will include your previous cursor
// So in my case perPage gets 6 records and the first query returns four results and the cursor is 29:
// Without skip: 1, the second query returns 6 results after (and including) the cursor
// So page 1 would be 24, 25, 26, 27, 28, 29 and the second page would start 29, 30, 31, 32, 33, 34
// In other words, the last item displayed on page 1 would be the first item displayed on page 2

interface AllItemsData {
  items: Item[];
  itemWatch: {
    type: string;
    item: Item;
  }
}

interface AllItemsVars {
  skip: number;
}

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(
      take: $first, 
      skip: $skip, 
      orderBy: {
        createdAt: desc
      }
    ){
      id
      title
      price
      description
      mainDescription
      image
      largeImage
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
      User {
        id
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
`;

const ALL_ITEMS_SUBSCRIPTION = gql`
  subscription {
    itemWatch {
      type
      item {
        id
        title
        price
        description
        mainDescription
        image
        largeImage
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
        User {
          id
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

interface LocalItemData {
  items: Item[];
}

const LOCAL_STATE_QUERY = gql`
  query {
    items @client {
      id
      Color {
        id
        label
        name
      }
      description
      mainDescription
      image
      largeImage
      itemvariants {
        id
      }
      price
      quantity
      Size {
        id
        label
        name
      }
      title
      User {
        id
      }
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    grid-template-columns: 1fr;
  }
`;

//Items.
const Items = props => {
  const client = useClient();
  //const { userip } = useCart(); //useContext(UserContext); // From pages/_app.js
  const { user_ip, user_Agent, url, urlReferer } = props; // From pages/index.js

  const ScrollToComp = el => el && el.scrollTo(0, 190);

  // User hook
  const user = useUser();

  // LocalState Query
  const { data: cachedItem, error: errorQuery, loading: loadingQuery } = useQuery<LocalItemData, {}>(
    LOCAL_STATE_QUERY,
  );

  // ALL Items Query
  const { subscribeToMore, ...result } = useQuery<AllItemsData, AllItemsVars>(
    ALL_ITEMS_QUERY,
    { 
      variables: {  
        skip: props.page * perPage - perPage, 
      } 
    }
  );

  // User hook variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} />;

  const me = user.data.me;
  let userID = me && me.id;
  let userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  // LocalState Query Variables
  if (errorQuery) return <Error error={errorQuery} />;

  // ALL Items Query Variables
  if (result.error) return <p>Error: {result.error.message}</p>;

  let meCheck = !me ? cachedItem : me;
  let data1 = !result.data || (result.loading && !result.data.items) ? meCheck : result.data;

  return (
    <>
    <IpBrowserDetails client={client} userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} urlReferer={urlReferer} />
    <Center>
      <div ref={ScrollToComp}></div>
      <Pagination page={props.page} />
      <ItemsListItems
        //networkStatus={result.networkStatus}
        loading={result.loading}
        error={result.error}
        data={data1}
        urlReferer={urlReferer}
        //page={props.page}
        subscribeToNewItems={() =>
          subscribeToMore({
            document: ALL_ITEMS_SUBSCRIPTION,
            variables: {},
            updateQuery: (prev, { subscriptionData }) => {
              //console.log("SubscriptionWatch in Items.js = ", subscriptionData.data);
              if (!subscriptionData.data) return prev;

              const newItem = subscriptionData.data.itemWatch.item; //subscriptionData.data.item.node;
              const mutationType = subscriptionData.data.itemWatch.type;
              //console.log("mutationType = ", mutationType);

              // Check that the item doesn't already exist in the store
              //console.log("newItem in components/Items.js = ", newItem);
              if (prev.items.find((item) => item.id === newItem.id)) {
                return prev;                    
              }

              if (mutationType === 'CREATED') {
                return Object.assign({}, prev, {
                  items: [newItem, ...prev.items]
                });
              }
            }
          })
        }
      />
      <Pagination page={props.page} />
    </Center>
    </>
  );
}

export default memo(Items);
export { ALL_ITEMS_QUERY };
