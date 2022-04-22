import { useSubscription } from "@apollo/client";
import { gql } from "apollo-server-core";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useRTC } from "../contexts/rtc.context";
import {
  OnNewParticipantSubscription,
  OnNewParticipantSubscriptionVariables
} from "../__generated__/grahql";

const SUB_TO_PARTICIPANT = gql`
  subscription OnNewParticipant($roomId: String!) {
    subscribeToParticipants(roomUuid: $roomId) {
      uuid
    }
  }
`;

export const useRoom = () => {
  const { query } = useRouter();
  const { data } = useSubscription<
    OnNewParticipantSubscription,
    OnNewParticipantSubscriptionVariables
  >(SUB_TO_PARTICIPANT, {
    shouldResubscribe: true,
    variables: { roomId: query.uuid as string },
  });

  const { peerConnection } = useRTC();

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  useEffect(() => {
    console.log(query.uuid);
  }, []);
};
