import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { apolloClient } from "../clients/apollo.client";

export default function AppContext({ children }: PropsWithChildren<{}>) {
  return (
    <ApolloProvider client={apolloClient}>
      <ChakraProvider>{children}</ChakraProvider>
    </ApolloProvider>
  );
}
