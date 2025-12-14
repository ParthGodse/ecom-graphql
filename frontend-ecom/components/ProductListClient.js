// components/ProductListClient.js
'use client';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import client from '../lib/apollo';
import ProductCard from './ProductCard';

const PRODUCTS_QUERY = gql`
  query Products($take: Int) {
    products(take: $take) {
      id
      name
      description
      priceCents
      inventory
    }
  }
`;

export default function ProductListClient() {
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, { client, variables: { take: 48 } });

  if (loading) return <div className="text-center py-24">Loading…</div>;
  if (error) return <div className="text-center py-24 text-red-500">Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data.products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
