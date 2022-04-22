import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { PropsWithChildren, useEffect } from "react";
import { apolloClient } from "../clients/apollo.client";
import { RTCContextProvider } from "./rtc.context";

export default function AppContext({ children }: PropsWithChildren<{}>) {
  useEffect(() => {
    console.log("! AppContext mounted");

    return () => {
      console.log("$ Unmounted app context");
    };
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <RTCContextProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </RTCContextProvider>
    </ApolloProvider>
  );
}
