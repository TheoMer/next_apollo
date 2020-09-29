import React, { FC, memo } from 'react';
import { gql, useQuery  } from '@apollo/client';
import { format } from 'date-fns';
import Head from 'next/head';
import { useRouter } from 'next/router';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import OrderStyles from './styles/OrderStyles';
import IpBrowserDetails from './IpBrowserDetails';
import { useUser } from './User';
import { useClient } from '../lib/Client';

interface User {
  id: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
  label: string;
}

interface Size {
  id: string;
  name: string;
  label: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  mainDescription: string;
  price: number;
  image: string;
  quantity: number;
  itemid: string;
  Color: Color;
  Size: Size;
}

interface Order {
  id: string;
  charge: string;
  total: number
  card_brand: string;
  last4card_digits: string;
  card_name: string;
  createdAt: string;
  address_line: string;
  city: string;
  postcode: string;
  country: string;
  User: User;
  items: Item[];
}

interface singleOrderData {
  order: Order;
}

interface singleOrderVariables {
  id: string;
}

const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY($id: String!) {
    order(id: $id) {
      id
      charge
      total
      card_brand
      last4card_digits
      card_name
      createdAt
      address_line
      city
      postcode
      country
      User {
        id
        name
      }
      items {
        id
        title
        description
        mainDescription
        price
        image
        quantity
        itemid
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
      }
    }
  }
`;

interface Props {
  id: string;
  user_ip: string;
  user_Agent: string;
  url: string;
  urlReferer?: string;
}

// Export added to class for Order.test.js can handle this.props.router.query withRouter issue.
// https://stackoverflow.com/questions/53771515/jest-enzyme-error-uncaught-typeerror-cannot-read-property-query-of-undefin 
export const Order: FC<Props> = ({ id, user_ip, user_Agent, url, urlReferer }) => {
  const router = useRouter();
  const { onToken } = router.query;
  //const { user_ip, user_Agent, url, urlReferer } = props; // From pages/order.js

  // User hook
  const user = useUser();

  // SINGLE ORDER QUERY
  const { data: dataSingleOrder, error: erroSingleOrder, loading: loadingSingleOrder } = useQuery<
  singleOrderData, singleOrderVariables>(
    SINGLE_ORDER_QUERY,
    { 
      variables: {
        id: id
      },
      fetchPolicy: 'cache-first'
    }
  );

  // Client
  const client = useClient();

  // User hook variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} page="" />;

  const me = user.data.me;

  const userID = me && me.id;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';
  
  // SINGLE ORDER QUERY Variables
  if (erroSingleOrder) return <Error error={erroSingleOrder} page="" />;
  if (loadingSingleOrder) return <p>Loading...</p>;
  const order = dataSingleOrder.order;

  return (
    <>
    <IpBrowserDetails userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} />

    <OrderStyles data-test="order">
      <Head>
        <title>Flamingo | Women's Swimwear | Ethically Made In The UK - Order {order.id}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <h2>{onToken ? 'Receipt - Your order was successfully processed.' : 'Your receipt reads as follows:'}</h2>
      <p>
        <span>Order ID:</span>
        <span>{id}</span>
      </p>
      <p>
        <span>Charged to:</span>
        <span>{order.card_brand}{"...."}{order.last4card_digits}</span>
      </p>
      <p>
        <span>Date:</span>
        <span>{format(new Date(order.createdAt), 'PPPP')}</span>
      </p>
      <p>
        <span>Shipping:</span>
        <span>{order.card_name}, <br/> 
        {order.address_line}, <br/>
        {order.city}, <br/>
        {order.postcode}, <br/>
        {order.country}
        </span>
      </p>
      <p>
        <span>Order Total:</span>
        <span>{formatMoney(order.total)}</span>
      </p>
      <p>
        <span>Item Count:</span>
        <span>{order.items.reduce((a, b) => a + b.quantity, 0)}</span>
      </p>
      <div className="items">
        {order.items.map(item => (
          <div className="order-item" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="item-details">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>Colour: {item.Color.label}</p>
              <p>Size: {item.Size.label}</p>
              <p>Qty: {item.quantity}</p>
              <p>Price: {formatMoney(item.price)}</p>
              <p>SubTotal: {formatMoney(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>
    </OrderStyles>
    </>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return prevProps.id === nextProps.id; 
}

export default memo(Order, arePropsEqual);
export { SINGLE_ORDER_QUERY };
