import { FC, memo, createRef } from 'react';
import { gql } from '@apollo/client';
//import { withApollo } from '@apollo/client/react/hoc';
import { ChildDataProps, graphql } from '@apollo/client/react/hoc';
import styled from 'styled-components';
import Error from './ErrorMessage';
import IpBrowserDetails from './IpBrowserDetails';
//import { useUser } from './User';
import OrderListItem from './OrderListItem';
//import ScrollArea from './styles/ScrollArea';
import { NextPage } from 'next';

interface User {
  id: string;
}

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

interface Item {
  id: string;
  title: string;
  price: number;
  description:  string;
  mainDescription: string;
  image: string;
  largeImage: string;
  quantity: number;
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

type Order = {
  id: string;
  total: number;
  createdAt: string;
  items: Item[];
  User: User;
};

type Response = {
  orders: Order[];
};

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

type InputProps = {
    me: me,
    user_ip: string;
    user_Agent: string;
    url: string;
    urlReferer: string;
};

type Variables = {
  userId: string;
};

const USER_ORDERS_QUERY = gql`
  query USER_ORDERS_QUERY($userId: String) {
    orders(where: { user: { equals: $userId } }, orderBy: { createdAt: desc }) {
      id
      total
      createdAt
      items {
        id
        title
        price
        description
        mainDescription
        quantity
        image
      }
      User {
        id
      }
    }
  }
`;

type ChildProps = ChildDataProps<InputProps, Response, Variables>;

// props.me is specified in pages/orders.jsx
const userOrdersQuery = graphql<InputProps, Response, Variables, ChildProps>(
  USER_ORDERS_QUERY,
  {
    options:({me}) => ({
      variables: {
        userId: me.id,
      },
      fetchPolicy: 'cache-and-network',
      pollInterval: 300
    })
  }
);

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    grid-template-columns: 1fr;
  }
`;

interface Props {
  me: any;
  data?: any;
  user_ip?: string;
  user_Agent?: string;
  url?: string;
  client?: any;
  urlReferer?: string;
}

//Orderlist
const OrderList: FC<Props> = ({ me, user_ip, user_Agent, url, urlReferer, client, data: { orders, loading: loadingQuery, error: errorQuery, stopPolling }}) => {
  //const { me, user_ip, user_Agent, url, urlReferer, client, data: { orders, loading: loadingQuery, error: errorQuery, startPolling, stopPolling, subscribeToMore }} = props;
  stopPolling(600);
  //const myRef = React.createRef();

  const isDuplicateOrder = (newOrderId, existingOrders) => {
    let duplicateOrder = false;
    existingOrders.map((order, index) => {
      if (newOrderId === order.id) {
        duplicateOrder = true;
      }
    });

    return duplicateOrder;
  }

  const scrollToComp = el => el && el.scrollIntoView();

  /* Note: me is being (experimentally) pulled in from pages/orders.jsx */

  // User hook
  /*const user = useUser();
  if (!user) return null;
  if (user.error) return <Error error={user.error} />;

  const me = user.data.me;*/

  const userID = me && me.id;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  let usersOrders;

  if (!orders || (loadingQuery && orders.length == 0)) return <p>Loading your order receipts...</p>;
  if (errorQuery) return <Error error={errorQuery} />;
  if (orders.length >= 1) {
    usersOrders =  (
      <div>
        <h2>You have {orders.length} order{orders.length > 1 ? 's' : ''}.</h2>
        <OrderListItem 
          orders={orders}
        />
      </div>
    )
  } else if (orders.length == 0) {
    usersOrders =  (
      <div>
        <h2>You have no orders.</h2>
      </div>
    )
  }
  
  // Note: If scrolling (overflow: scroll) is disabled in page.js remember 
  // to take away the ScrollArea div otherwise when the page loads the first viewable
  // item will be the items and not the actual header + search bar
  return (
    <>
    <IpBrowserDetails client={client} userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} urlReferer={urlReferer} />
    {/*<ScrollArea ref={scrollToComp}>*/}
      {usersOrders}
    {/*</ScrollArea>*/}
    </>
  );
}

//const ItemWithApollo = withApollo(OrderList)
export default userOrdersQuery(OrderList);
