// lib/graphqlFetch.js
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/';

export async function graphqlFetch(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON response from GraphQL server: ${e.message}\nResponse text: ${text}`);
  }

  if (json.errors) {
    const message = json.errors.map(e => e.message).join(', ');
    throw new Error(`GraphQL errors: ${message}`);
  }
  return json.data;
}
