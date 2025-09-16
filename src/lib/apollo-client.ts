import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

const authLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') {
    return { headers };
  }

  const token = Cookies.get('token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      'Content-Type': 'application/json',
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  ssrMode: typeof window === 'undefined',
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export default client; 