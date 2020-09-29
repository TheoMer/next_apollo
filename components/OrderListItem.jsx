import React, { memo } from 'react';
import { parseISO, formatDistance } from 'date-fns';
import Link from 'next/link';
import styled from 'styled-components';
import {CloudinaryContext, Image, Transformation} from 'cloudinary-react'
import formatMoney from '../lib/formatMoney';
import OrderItemStyles from './styles/OrderItemStyles';

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

const imgUrl = img => {
  const imgSplit = img.split("flamingo/");
  const newImgUrl = 'flamingo/' + imgSplit[1];

  return newImgUrl;
}

const newedate = (_date) => {
  const options = {dateStyle: 'medium'}; //{ weekday: 'long', hour: 'numeric'};
  const dateT = new Intl.DateTimeFormat('en-UK', options).format(_date);
  return dateT;
}

// Orderlist
const OrderListItem = ({ orders }) => {

 return (
    <div>
      <OrderUl>
        {orders.map(order => (
          <OrderItemStyles key={order.id}>
            <Link 
              href={{
                pathname: '/order',
                query: { id: order.id }
              }}
            >
              <a>
                <div className="order-meta">
                  <p>{order.items.reduce((a, b) => a + b.quantity, 0)} Item{(order.items.length) > 1 ? 's' : ''}</p>
                  {/*}order.items.length} Product{(order.items.length) > 1 ? 's' : ''}</p>*/}
                  {/*<p>{formatDistance(parseISO(order.createdAt), new Date())} ago</p>*/}
                  <p>{newedate(parseISO(order.createdAt))}</p>
                  <p>{formatMoney(order.total)}</p>
                </div>
                <div className="images">
                  {order.items.map((item, index) => (
                    <>
                    {/*<img key={item.id} src={item.image} alt={item.title} />*/}
                    <Image key={item.id} cloudName="theomer" publicId={imgUrl(item.image)}>
                      <Transformation defaultImage="flamingo:default.jpg" />
                    </Image>
                  </>
                  ))}
                </div>
              </a>
            </Link>
          </OrderItemStyles>
        ))}
      </OrderUl>
    </div>
  );
}

export default memo(OrderListItem);
