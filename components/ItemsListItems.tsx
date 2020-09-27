import React, { FC, memo, useEffect } from 'react';
import styled from 'styled-components';
import Item from './Item';

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

interface Props {
  data: {
    items: Item[]
  };
  loading: boolean;
  error: {
    message: string
  };
  urlReferer?: string;
  //page: string;
  subscribeToNewItems: any;
}

// Item list items.
const ItemsListItems: FC<Props> = ({ data, urlReferer, loading, error, subscribeToNewItems }) => {
  useEffect(() => {
    let isSubscribed = true;
    if(isSubscribed) {
      subscribeToNewItems()
    }
    return () => {
      isSubscribed = false
    };
  },[urlReferer]);

  if (error) return <p>Error: {error.message}</p>;
  
  if (!data || (loading && !data.items)) return <p>Loading Items...</p>;

  if (data.items) {
    return (
      <ItemsList>{data.items.map(item =><Item item={item} key={item.id} urlReferer={urlReferer} />)}</ItemsList>
    );
  }
}

export default memo(ItemsListItems);
