import React, { memo } from 'react';
import { gql, useQuery } from '@apollo/client';
import Head from 'next/head';
import Link from 'next/link';
import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

interface itemsConnection {
  count: number;
}

interface PaginiationData {
  itemsConnection: itemsConnection;
  items: any;
}

interface PaginiationVars {
  id: string;
}

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection(
      where: {
        price: {
          gt: 0
        }
      }
    ){
      count
    }
  }
`;

// Paginiation
const Pagination = props => {

  const { data: dataPagination, error: errorPagination, loading: loadingPagination } = useQuery<PaginiationData, PaginiationVars>(
    PAGINATION_QUERY,
    { 
      variables: {  
        id: props.id
      },
      fetchPolicy: 'cache-first'
    }
  );

  if (!dataPagination || (loadingPagination && !dataPagination.items)) return null;
  const count = dataPagination.itemsConnection.count;
  const pages = Math.ceil(count / perPage);
  const page = props.page;
  let output;

  if (count > perPage) {
    output = (
      <PaginationStyles data-test="pagination">
        <Head>
          <title>
          Flamingo | Women's Swimwear | Ethically Made In The UK — Page {page} of {pages}
          </title>
        </Head>
        <Link
          href={{
            pathname: 'items',
            query: { page: page - 1 },
          }}
        >
          <a className="prev" aria-disabled={page <= 1}>
            ← Prev
          </a>
        </Link>
        <p>
          Page {props.page} of
          <span className="totalPages">{pages}</span>!
        </p>
        <p>{count} Items Total</p>
        <Link
          href={{
            pathname: 'items',
            query: { page: page + 1 },
          }}
        >
          <a className="next" aria-disabled={page >= pages}>
            Next →
          </a>
        </Link>
      </PaginationStyles>
    );
  } else {
    output = (
      <PaginationStyles data-test="pagination">
        <Head>
          <title>
          Flamingo | Women's Swimwear | Ethically Made In The UK
          </title>
        </Head>
      </PaginationStyles>          
    )
  }

  return (
    output
  )
};

export default memo(Pagination);
export { PAGINATION_QUERY };
