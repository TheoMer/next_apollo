import React, { memo } from 'react';
import { gql, useQuery } from '@apollo/client';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      password
      permissions2
      address {
        id
        card_name
        address_line
        city
        postcode
        country
      }
      order {
        id
      }
      items {
        id
        price
        image
        largeImage
        image2
        largeImage2
        image3
        largeImage3
        image4
        largeImage4
        image5
        largeImage5
        image6
        largeImage6
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
        itemvariants {
          id
          price
          image
          largeImage
          image2
          largeImage2
          image3
          largeImage3
          image4
          largeImage4
          image5
          largeImage5
          image6
          largeImage6
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
      cart(orderBy: { createdAt: desc }) {
        id
        quantity
        ItemVariants {
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
        Item {
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
  }
`;

// User
function useUser() {

  const { ...result } = useQuery(CURRENT_USER_QUERY);

  if (result.data) {
    return result;
  }
  
}

export { CURRENT_USER_QUERY, useUser };

