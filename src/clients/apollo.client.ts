import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

let apolloClient: ApolloClient<any> = new ApolloClient({
  cache: new InMemoryCache(),
});

const GQL_ENDPOINT = "/api/graphql";

if (typeof window !== "undefined") {
  const { origin } = window.location;

  const wsLink = new GraphQLWsLink(
    createClient({
      url: origin.concat(GQL_ENDPOINT),
    })
  );

  const httpLink = new HttpLink({
    uri: origin.concat(GQL_ENDPOINT),
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
