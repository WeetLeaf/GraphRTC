import { gql, useApolloClient, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { configuration } from "../../config/rtc.config";
import { mapTypeOffer } from "../../utils/mapTypeOffer";
import {
  SendOfferMutation,
  SendOfferMutationVariables,
  SubscribeToAnwserSubscription,
  SubscribeToAnwserSubscriptionVariables,
} from "../../__generated__/grahql";
import { RTCCommonType } from "./type";

type Props = RTCCommonType;

const SEND_OFFER = gql`
  mutation SendOffer($offer: OfferInput!, $room: String!, $user: String!) {
    sendUserOffer(offer: $offer, roomUuid: $room, userUuid: $user)
  }
`;

const SUB_TO_ANSWER = gql`
  subscription SubscribeToAnwser($offerSdp: String!, $roomUuid: String!) {
    subscribeToAnswers(offerSdp: $offerSdp, roomUuid: $roomUuid) {
      sdp
      type
    }
  }
`;

export const RTCCall = (props: Props) => {
  const { query } = useRouter();
  const [peerConnection] = useState(new RTCPeerConnection(configuration));
  const apollo = useApolloClient();

  const [sendOffer] = useMutation<
    SendOfferMutation,
    SendOfferMutationVariables
  >(SEND_OFFER, {
    onError: (e) => {
      console.log("Error sending offer: ", e);
    },
  });

  const setAnswerListener = useCallback((offer: RTCSessionDescriptionInit) => {
    if (!offer.sdp) {
      console.error("No offer sdp");
      return;
    }
    const subscription = apollo.subscribe<
      SubscribeToAnwserSubscription,
      SubscribeToAnwserSubscriptionVariables
    >({
      query: SUB_TO_ANSWER,
      variables: {
        offerSdp: offer.sdp,
        roomUuid: query.uuid as string,
      },
    });

    const listener = subscription.subscribe(({ data }) => {
      if (!data) return;
      console.log("Received answer: ", data.subscribeToAnswers);
      listener.unsubscribe();
    });

    return () => {
      listener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("Try to call: ", props.userUuid);
    (async () => {
      console.log("Sending offer to: ", props.userUuid);
      let offer = await peerConnection.createOffer();
      setAnswerListener(offer);
      sendOffer({
        variables: {
          offer: { type: mapTypeOffer(offer.type), sdp: offer.sdp },
          room: query.uuid as string,
          user: props.userUuid,
        },
      });
    })();
  }, []);

  return <div>rtc.call</div>;
};
