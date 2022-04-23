import {
  useApolloClient,
  useLazyQuery,
  useMutation,
  useSubscription,
} from "@apollo/client";
import { gql } from "apollo-server-core";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useRTC } from "../contexts/rtc.context";
import { mapTypeOffer } from "../utils/mapTypeOffer";
import {
  IsReadySubscription,
  JoinRoomQuery,
  JoinRoomQueryVariables,
  OnNewParticipantSubscription,
  OnNewParticipantSubscriptionVariables,
  OnOfferSubscription,
  OnOfferSubscriptionVariables,
  SendOfferMutation,
  SendOfferMutationVariables,
} from "../__generated__/grahql";

const SUB_TO_PARTICIPANT = gql`
  subscription OnNewParticipant($roomId: String!) {
    participant: subscribeToParticipants(roomUuid: $roomId) {
      uuid
    }
  }
`;

const JOIN_ROOM = gql`
  query JoinRoom($roomUuid: String!, $userUuid: String!) {
    joinRoom(roomUuid: $roomUuid, userUuid: $userUuid)
  }
`;

const SEND_OFFER = gql`
  mutation SendOffer($offer: OfferInput!, $room: String!, $user: String!) {
    sendUserOffer(offer: $offer, roomUuid: $room, userUuid: $user)
  }
`;

const SUB_TO_OFFER = gql`
  subscription OnOffer($room: String!, $user: String!) {
    offer: subscribeToOffers(roomUuid: $room, userUuid: $user) {
      sdp
      type
    }
  }
`;

export const useRoom = () => {
  const { identity, peerConnection } = useRTC();

  const apollo = useApolloClient();
  const { query } = useRouter();

  // Print my identity in the console
  useEffect(() => {
    console.log("My identity: ", identity);
  }, []);

  // Start subscribing to new participants
  // We never unsubscribe from this subscription
  const { data: onNewParticipant } = useSubscription<
    OnNewParticipantSubscription,
    OnNewParticipantSubscriptionVariables
  >(SUB_TO_PARTICIPANT, {
    shouldResubscribe: true,
    variables: { roomId: query.uuid as string },
  });

  const [sendOffer] = useMutation<
    SendOfferMutation,
    SendOfferMutationVariables
  >(SEND_OFFER, {
    onError: (e) => {
      console.log("Error sending offer: ", e);
    },
  });

  // Subscribe to offers
  useEffect(() => {
    const subscription = apollo.subscribe({
      query: SUB_TO_OFFER,
      variables: {
        room: query.uuid as string,
        user: identity,
      },
    });

    const listener = subscription.subscribe(({ data }) => {
      console.log("Received offer: ", data);
    });

    return () => {
      listener.unsubscribe();
    };
  }, []);

  const [joinRoom] = useLazyQuery<JoinRoomQuery, JoinRoomQueryVariables>(
    JOIN_ROOM,
    {
      onError: (e) => {
        console.log("Error joining room: ", e);
      },
    }
  );

  // Join the room when websocket is ready
  useEffect(() => {
    const subscription = apollo.subscribe<IsReadySubscription>({
      query: gql`
        subscription IsReady {
          isConnectionReady
        }
      `,
    });

    const listener = subscription.subscribe(({ data }) => {
      if (data?.isConnectionReady) {
        console.log("Connection ready");
        joinRoom({
          variables: { roomUuid: query.uuid as string, userUuid: identity },
        });
        listener.unsubscribe();
      }
    });

    return () => {
      listener.unsubscribe();
    };
  }, []);

  // Listen for new participants and send them offers
  useEffect(() => {
    if (!onNewParticipant?.participant.uuid) return;
    if (onNewParticipant.participant.uuid === identity) return;

    (async () => {
      console.log("Sending offer to: ", onNewParticipant.participant.uuid);
      let offer = await peerConnection.createOffer();
      sendOffer({
        variables: {
          offer: { type: mapTypeOffer(offer.type), sdp: offer.sdp },
          room: query.uuid as string,
          user: onNewParticipant.participant.uuid,
        },
      });
    })();
  }, [onNewParticipant]);
};
