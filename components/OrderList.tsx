import { memo, createRef } from 'react';
import { gql } from '@apollo/client';
import { withApollo } from '@apollo/client/react/hoc';
import { graphql } from '@apollo/client/react/hoc';
import styled from 'styled-components';
import Error from './ErrorMessage';
import IpBrowserDetails from './IpBrowserDetails';
import { useUser } from './User';
import OrderListItem from './OrderListItem';
import ScrollArea from './styles/ScrollArea';

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

// props.me is specified in pages/orders.jsx
const userOrdersQuery = graphql(
  USER_ORDERS_QUERY,
  {
    options: props => ({
      variables: {
        userId: props.me.id,
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

//Orderlist
const OrderList = props => {
  const { me, user_ip, user_Agent, url, urlReferer, client, data: { orders, loading: loadingQuery, error: errorQuery, startPolling, stopPolling, subscribeToMore }} = props;
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
          urlReferer={urlReferer}
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

const ItemWithApollo = withApollo(OrderList)
export default memo(userOrdersQuery(ItemWithApollo));
