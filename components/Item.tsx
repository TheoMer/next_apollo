import React, { FC, memo, useEffect } from 'react';
import { gql } from '@apollo/client';
import { graphql, ChildDataProps } from '@apollo/client/react/hoc';
import PropTypes from 'prop-types';
import Link from 'next/link';
import update from 'immutability-helper';
import Title from './styles/Title';
import ItemStyles from './styles/ItemStyles';
//import PriceTag from './styles/PriceTag';
import formatMoney from '../lib/formatMoney';
import DeleteItem from './DeleteItem';
import DeleteItemLoggedOut from './DeleteItemLoggedOut';
import AddToCart from './AddToCart';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import { ALL_ITEMS_QUERY } from './Items';
import { useClient } from '../lib/Client';
//import { perPage } from '../config';

/* Info about React.memo taken from: https://logrocket.com/blog/pure-functional-components/ */

/* Note: How to specify a dynamic background-image 
   Taken from: https://github.com/facebook/create-react-app/issues/3238
    const Content = styled.div`
        background-image: url(${props => props.img});
    `;
    <Content img={ImagePath} />
    Also See: https://github.com/styled-components/styled-components/issues/1142
    const HeaderImg = styled.img.attrs({
        src: 'image url here'
    })`
    width: 100px;
    height: 100px;
    border: 1px solid blue;
    <HeaderImg src={'https://cdn.cnn.com/cnnnext/dam/assets/180301124611-fedex-logo.png'} />
*/

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

interface address {
  id: string;
  card_name: string;
  address_line: string;
  city: string;
  postcode: string;
  country: string;
}

interface order {
  id
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
  image2: string;
  largeImage2: string;
  image3: string;
  largeImage3: string;
  image4: string;
  largeImage4: string;
  image5: string;
  largeImage5: string;
  image6: string;
  largeImage6: string;
  quantity: number;
  Color: Color;
  Size: Size;
  User: User;
  itemvariants: ItemVariants[]
}

const DELETE_ITEM_SUBSCRIPTION = gql`
  subscription {
    itemDeleted {
      type
      item {
        id,
        userIdentity
      }
    }
  }
`;

enum Permissions {
  ADMIN,
  GUEST_USER,
  ITEMCREATE,
  ITEMDELETE,
  ITEMUPDATE,
  PERMISSIONUPDATE,
  USER
}

interface permissions2 {
  permissions2: Permissions
}

type me = {
  id: string;
  email: string;
  name: string;
  password: string;
  permissions2: permissions2;
  address: address;
  order: order;
  items: Item[];
  cart: {
    id: string;
    quantity: string;
    ItemVariants: ItemVariants[];
    Item: Item[]
  }
}

type Response = {
  me: me
};

type ChildProps = ChildDataProps<{}, Response, {}>

const userQuery = graphql<{}, Response, {}, ChildProps>(
  CURRENT_USER_QUERY,
  {
    options: { 
      fetchPolicy: 'cache-and-network',
      pollInterval: 300
    },
  }
);

interface Props {
  data?: any;
  item?: Item;
  urlReferer?: string;
}

const querySubscribe = (data, client) => {
  let items: Item;
  let index;

  const isDuplicateItem = (deletedItem, existingItems) => {
    let duplicateItem = -1;

    existingItems.map((item, index) => {
      if (deletedItem.id == item.id) {
        duplicateItem = index;
      }
    });

    return duplicateItem;
  }

  data.subscribeToMore({
  document: DELETE_ITEM_SUBSCRIPTION,
  updateQuery: (previousResult, { subscriptionData }) => {
    if (!subscriptionData.data) return previousResult;

    console.log("SubscriptionWatch in Item.js = ", subscriptionData.data);
                
    let deletedItem = subscriptionData.data.itemDeleted.item;

    let prevFromCache = client.readQuery({query: ALL_ITEMS_QUERY});

    // Had to put this prevFromCache check because calling client.resetStore() causes prevFromCache
    // to be destroyed, and thus throws an error as a result of the component being re-rendered.
    if (prevFromCache) {
      items = previousResult.me.items.length == 0 ? prevFromCache.items : previousResult.me.items;
      index = isDuplicateItem(deletedItem, items);

      if (index != -1) {
        // Create a new item list minus the one to delete
        if (previousResult.me.items.length == 0) {
          let data = update(prevFromCache, {
            items: { $splice: [[[index] as any, 1]] }
          });
          client.writeQuery({ query: ALL_ITEMS_QUERY, data });
        } else {
          let newList = update(previousResult, {
            me: {
              items: { $splice: [[[index] as any, 1]] }
            }
          });
          //console.log("newList = ", newList);
          // If the item is being deleted from the delete button, then
          // don't resetStore as it will throw errors for the Admin user
          let buttonCheck = deletedItem.item.userIdentity.split("-");

          if (previousResult.me.id != buttonCheck[0]) {
            //client.clearStore();
            client.resetStore();
          }
          return Object.assign({}, previousResult, {
            newList
          });
        }
      } else {
        // Return the existing list as the item to delete is already deleted from the list
        return previousResult;
      }
    }
  },
  });
}

// Item
const Item: FC<Props> = ({ data, item, urlReferer, data: { me, error, stopPolling }}) => {
  const client = useClient();
  stopPolling(600);
  
  //The sum total of variant items available for purchase.
  let quantity = item.itemvariants.reduce((a, variant) => a + variant.quantity, 0);

  useEffect(() => {
    let isSubscribed = true;
    if(isSubscribed) {
      querySubscribe(data, client);
    }
    return () => {
      //querySubscribe.unsubscribe;
      isSubscribed = false
    };
  },[urlReferer]);

  if (error) return <Error error={error} />;
  // if (loading) return <p>Loading...</p>;

  // If (me) determine whether user have admin permissions else hasPerms = false
  let hasPerms;
  hasPerms = (me && me === null) ? false : (me && me.permissions2.some(permission => ['ADMIN'].includes(permission)));

  return (
  <ItemStyles>
      <Link 
        href={{
          pathname: '/item',
          query: { id: item.id }
        }}
      >
        <a>{item.image && <img src={item.image} layout="responsive" alt={item.title} />}</a>
      </Link>
    <Title>
      <Link 
        href={{
          pathname: '/item',
          query: { id: item.id }
        }}
      >
        <a>{item.title}</a>
      </Link>
    </Title>
    {/* <PriceTag>{formatMoney(item.price)}</PriceTag> */}
    <p>{item.description}</p> <span>{ (quantity <= 10 && quantity !== 0) && `(${quantity} in stock)` }</span>
    <div className="price">{formatMoney(item.price)}</div>
    <div className="buttonList">
      <AddToCart id={item.id} itemDetails={{ ...item }} signedIn={me} />
      {hasPerms && (
      <>
      <Link 
        href={{
          pathname: 'update',
          query: { id: item.id }
        }}
      >
        <a>Edit ✏️</a>
      </Link>
      {/* Make sure to replicate any changes made in DeleteItem in DeleteItemLoggedOut below */}
      <DeleteItem 
        id={item.id}
        urlReferer={urlReferer}
      >Delete This Item</DeleteItem>
      </>
      )}
      {/* If user is not an Admin */}
      {!hasPerms && (
      <>
      <DeleteItemLoggedOut 
        id={item.id}
        urlReferer={urlReferer}
      />
      </>
      )}
    </div>
  </ItemStyles>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return prevProps.item === nextProps.item; 
}

/*Item.propTypes = {
  item: PropTypes.object.isRequired,
};*/

export default memo(userQuery(Item), arePropsEqual);
