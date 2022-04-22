import { gql, useMutation, useSubscription } from "@apollo/client";
import { useToast } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { apolloClient } from "../../clients/apollo.client";
import {
  OnSubscriptionWorksSubscription,
  TestSubMutationMutation,
} from "../../__generated__/grahql";

const SUBSCRIBE_MUTATION = gql`
  subscription onSubscriptionWorks {
    serverStatus
  }
`;

const TRIGGER_MUTATION = gql`
  mutation TestSubMutation {
    testSubscription
  }
`;

export default function SubTestPage() {
  const toast = useToast();

  useEffect(() => {
    console.log("! SubTestPage mounted");
  }, []);

  const { data, error } = useSubscription<OnSubscriptionWorksSubscription>(
    SUBSCRIBE_MUTATION,
    {
      shouldResubscribe: true,
    }
  );

  console.log("error", typeof error);

  const [trigger] = useMutation<TestSubMutationMutation>(TRIGGER_MUTATION, {
    onError: (e) => {
      toast({
        title: "Error",
        description: e.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {
    if (!data) return;
    toast({
      title: "Subscription works!",
      description: "Number : " + data?.serverStatus,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  }, [data, toast]);

  return (
    <button
      type="button"
      onClick={() => {
        trigger();
      }}
      className="relative px-4 py-2 rounded bg-theme hover:bg-theme/90 text-white items-center flex justify-center font-semibold w-full focus:outline-none focus:ring focus:ring-offset-2 focus:ring-theme focus:ring-opacity-80 cursor-pointer"
    >
      Trigger subscription !!
    </button>
  );
}
