import React, { memo } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import Downshift, { resetIdCounter } from 'downshift';
import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';
import { useCart } from './LocalState';

interface itemsData {
  items: any;
}

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: { 
        OR: [
          { 
            title: {
              contains: $searchTerm
            }
          }, 
          { 
            description: {
              contains: $searchTerm 
            }
          }
        ] 
      }
    ) {
      id
      image
      title
    }
  }
`;


const AutoComplete = () => {
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const { cartOpen } = useCart();

  const router = useRouter();

  const routeToItem = item => {
    router.push({
      pathname: '/item',
      query: {
        id: item.id
      }
    });
  }

  const [findItems, { loading, data }] = useLazyQuery<itemsData, {}>(SEARCH_ITEMS_QUERY);
  const items = data ? data.items : [];
  const findItemsButChill = debounce(findItems, 350);

  resetIdCounter();

  return (
    <SearchStyles
      cartOpened={cartOpen}
    >
      <Downshift 
        onChange={routeToItem} 
        itemToString={item => (item === null ? '' : item.title)}
      >
        {({ 
          getInputProps, 
          getItemProps, 
          isOpen, 
          inputValue, 
          highlightedIndex 
        }) => (
          <div>
            <input
              {...getInputProps({
                type: 'search',
                placeholder: 'Search For An Item',
                id: 'search',
                className: loading ? 'loading' : '',
                onChange: e => {
                  let newStringText = capitalizeFirstLetter(e.target.value);
                  e.persist();
                  findItemsButChill({
                    variables: { searchTerm: newStringText }
                  });
                }
              })}
            />
            {isOpen && (
              <DropDown>
                {items != undefined && items.map((item, index) => (
                  <DropDownItem
                    {...getItemProps({ item })}
                    key={item.id}
                    highlighted={index === highlightedIndex}
                  >
                    <img width="50" src={item.image} alt={item.title} />
                    {item.title}
                  </DropDownItem>
                ))}
                {items != undefined && !items.length &&
                  !loading && <DropDownItem> Nothing Found {inputValue}</DropDownItem>}
              </DropDown>
            )}
          </div>
        )}
      </Downshift>
    </SearchStyles>
  );
}

export default memo(AutoComplete);
