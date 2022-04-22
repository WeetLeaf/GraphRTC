import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { apolloClient } from "../clients/apollo.client";
import { RTCContextProvider } from "./rtc.context";

export default function AppContext({ children }: PropsWithChildren<{}>) {
  return (
    <ApolloProvider client={apolloClient}>
      <RTCContextProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </RTCContextProvider>
    </ApolloProvider>
  );
}
