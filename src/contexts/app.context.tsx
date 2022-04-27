import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { apolloClient } from "../clients/apollo.client";

export default function AppContext({ children }: PropsWithChildren<{}>) {
  const router = useRouter();

  console.log(router);

  return (
    <ApolloProvider client={apolloClient}>
      <ChakraProvider>{children}</ChakraProvider>
    </ApolloProvider>
  );
}
