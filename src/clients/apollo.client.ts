import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

let apolloClient: ApolloClient<any> = new ApolloClient({
  cache: new InMemoryCache(),
});

if (typeof window !== "undefined") {
  console.info("Initializing Apollo client");
  console.info("GraphQL endpoint:", process.env.NEXT_PUBLIC_API_ENDPOINT);

  const wsLink = new GraphQLWsLink(
    createClient({
      url: process.env.NEXT_PUBLIC_API_WEBSOCKET_ENDPOINT,
      connectionAckWaitTimeout: 0,
      disablePong: false,
      retryAttempts: 10,
      keepAlive: Infinity,
    })
  );

  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_ENDPOINT,
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({ addTypename: false }),
  });
}
export { apolloClient };
