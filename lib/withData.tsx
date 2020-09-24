import { ApolloClient, ApolloLink, gql } from '@apollo/client';
import { InMemoryCache } from '@apollo/client/cache';
import { ApolloConsumer, split, createHttpLink, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { getDataFromTree } from '@apollo/client/react/ssr';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import withApollo from 'next-with-apollo';
import { endpoint, prodEndpoint, endpointWS, prodEndpointWS } from '../config';
import paginationField from './paginationField';
//import { useClient } from '../lib/Client';

const createClient = ({ headers, initialState }) => {
  const isBrowser = process.browser;

  const storeReset = props => {
    <ApolloConsumer>
      {client => (
          client.resetStore()
      )}
    </ApolloConsumer>
  };

  const httpLink = createHttpLink({
    uri: process.env.NODE_ENV === 'development' ? endpoint : prodEndpoint,
    fetchOptions: {
      credentials: 'include',
    },
    // pass the headers along from this request. This enables SSR with logged in state
    headers: {
      ...headers
    },
  });

  // Unable to find native implementation, or alternative implementation for Websocket!
  // was resolved here: https://github.com/apollographql/subscriptions-transport-ws/issues/333#issuecomment-359261024
  // const wsLink = process.browser ? new WebSocketLink({
  const wsLink = isBrowser ? new WebSocketLink({
    uri: process.env.NODE_ENV === 'development' ? endpointWS : prodEndpointWS,
    options: {
      reconnect: true,
      lazy: true
    }
  }) : null;

  // Issue of ws timeout resolved here: https://github.com/apollographql/subscriptions-transport-ws/issues/381#issuecomment-381381568
  if (wsLink) { 
    wsLink.subscriptionClient.on("connecting", () => {
      console.log("connecting");
    });
    
    wsLink.subscriptionClient.on("connected", () => {
      console.log("connected");
    });
    
    wsLink.subscriptionClient.on("reconnecting", () => {
      console.log("reconnecting");
    });
    
    wsLink.subscriptionClient.on("reconnected", () => {
      console.log("reconnected");
    });
    
    wsLink.subscriptionClient.on("disconnected", () => {
      console.log("disconnected");
    });
    
    wsLink.subscriptionClient.maxConnectTimeGenerator.duration = () =>
      wsLink.subscriptionClient.maxConnectTimeGenerator.max;
  }

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  // Taken from: https://www.apollographql.com/docs/react/advanced/subscriptions/#client-setup
  // const link = process.browser ? split(
  const linkURL = isBrowser ? split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  ) : httpLink;

  const cache = new InMemoryCache().restore(initialState || {});
  /*const cache = new InMemoryCache({
    dataIdFromObject: o => o.id,
  });*/
  /*const cache = new InMemoryCache({
    typePolicies: {
      /* The me.cart specification was taken from:  */
      /* https://deploy-preview-5677--apollo-client-docs.netlify.app/docs/react/v3.0-beta/caching/cache-field-behavior/#merging-non-normalized-objects */
      /* https://deploy-preview-5677--apollo-client-docs.netlify.app/docs/react/v3.0-beta/caching/cache-configuration/#generating-unique-identifiers */
      /*Query: {
        fields: {
          items: paginationField(),
        },
      },      
      me: {
        fields: {
          cart: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            },
          },
        },
      },
      items: {
        keyFields: ["id"],
      },        
    },
  }).restore(initialState || {});*/

  // defaultOptions  info taken from: https://www.apollographql.com/docs/react/api/apollo-client/#apolloclient
  // Info regarding returnpartialdata taken from: https://blog.apollographql.com/whats-new-in-apollo-client-2-6-b3acf28ecad1
  
  const client_ = new ApolloClient({
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
        returnPartialData: true,
        notifyOnNetworkStatusChange: true,
      },
    },
    connectToDevTools: true,
    ssrMode: typeof window === 'undefined', //Disables forceFetch on the server (so queries are only run once)
    //link: authLink.concat(link), // Change httpLink to link when setting up subscriptions
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );
        if (networkError)
          console.log(
            `[Network error]: ${networkError}. Backend is unreachable. Is it running?`
        );
      }),
      // If using authLink make sure to comment out headers in httpLink above
      linkURL, // YOUR LINK (NOW MATCHING YOUR CODE)
    ]),
    cache,
    assumeImmutableResults: true,
    resolvers: {
      Mutation: {
        signin: (_, variables, { cache }) => {
          storeReset();
        },
        signout: (_, variables, { cache }) => {
          storeReset();
        },
        updateGuestEmail: (_, variables, { cache }) => {
          storeReset();
        },
      },
    },
  });

  // Note: When adding items make sure to use the real id of the item on the production db.
  // This will enable users to interact with the site even upon initial site load.
  const data = {
    items: [
      {
        id: "ck0ifjild02kt07479ko212ry",
        Color: {
          id: "cjrumlijl003708947wpq15kp",
          label: "White",
          name: "white",
          __typename: "Color"
        },
        description: "Floral range swimwear specials.",
        mainDescription: "After much request our most popular summer 2018 swimwear outfit makes a reappearance.",
        image: "/static/tunic-v-neck-01.jpg",
        largeImage: "/static/tunic-v-neck-01.jpg",
        itemvariants: [{
          id: "1234",
          __typename: 'ItemVariants'
        }],
        price: 3500,
        quantity: 0,
        Size: {
          id: "cjrumlijl003708947wpq15kp",
          label: "Medium",
          name: "M",
          __typename: "Size"
        },
        title: "Crochet Beach Dress - Tunic V Neck.",
        User: {
          id: "cjo7q048b000408312h9c2fo0",
          __typename: "User"
        },
        __typename: "Item"
      },
      {
        id: "ck0id5vtp00hf074786sza5yv",
        Color: {
          id: "cjrumlijl003708947wpq15kp",
          label: "Gold",
          name: "gold",
          __typename: "Color"
        },
        description: "Golden v-neck range.",
        mainDescription: "The latest in our successful range of golden swimwear.",
        image: "/static/gold-bandage-swimsuit-01.jpg",
        largeImage: "/static/gold-bandage-swimsuit-01.jpg",
        itemvariants: [{
          id: "1234",
          __typename: 'ItemVariants'
        }],
        price: 7500,
        quantity: 0,
        Size: {
          id: "cjrumlijl003708947wpq15kp",
          label: "Medium",
          name: "M",
          __typename: "Size"
        },
        title: "Hollow Out Bandage Swimsuit.",
        User: {
          id: "cjo7q048b000408312h9c2fo0",
          __typename: "User"
        },
        __typename: "Item"
      },
      {
        id: "ck0e27onl00av071035uzliqt",
        Color: {
          id: "cjrumlijl003708947wpq15kp",
          label: "Military Green",
          name: "militarygreen",
          __typename: "Color"
        },
        description: "Push Up Low Waist Padded Swimwear.",
        mainDescription: "NAKIAEOI Sexy Bikinis Women Swimsuit 2017 Summer Beach Wear Bikini Set Push Up Swimwear Bandage Bathing Suit.",
        image: "/static/white-black-01.jpg",
        largeImage: "/static/white-black-01.jpg",
        itemvariants: [{
          id: "1234",
          __typename: 'ItemVariants'
        }],
        price: 3500,
        quantity: 0,
        Size: {
          id: "cjrumlijl003708947wpq15kp",
          label: "Medium",
          name: "M",
          __typename: "Size"
        },
        title: "Bandage Black & White Swimsuit.",
        User: {
          id: "cjo7q048b000408312h9c2fo0",
          __typename: "User"
        },
        __typename: "Item"
      }]
  };

  const LOCAL_STATE_QUERY = gql`
    query {
      items {
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

  cache.writeQuery({ query: LOCAL_STATE_QUERY, data })

  /* Added async due to the following typescript error */
  /* https://github.com/apollographql/apollo-client/issues/4804 */
  client_.onResetStore(async () => cache.writeQuery({ query: LOCAL_STATE_QUERY, data }));

  return client_;
}

export default withApollo(createClient, { getDataFromTree });
