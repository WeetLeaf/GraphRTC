import { gql, useApolloClient, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef } from "react";
import { configuration } from "../../config/rtc.config";
import { useRTC } from "../../contexts/rtc.context";
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
  const { current: peerConnection } = useRef(
    new RTCPeerConnection(configuration)
  );
  const { localStream } = useRTC();

  const { current: remoteStream } = useRef(new MediaStream());

  const videoRef = useRef<HTMLVideoElement>(null);

  const apollo = useApolloClient();

  const [sendOffer] = useMutation<
    SendOfferMutation,
    SendOfferMutationVariables
  >(SEND_OFFER, {
    onError: (e) => {
      console.error("Error sending offer: ", e);
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
    if (!localStream) return;
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  }, [localStream]);

  useEffect(() => {
    (async () => {
      let offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      peerConnection.addEventListener("track", (event) => {
        console.log("Got remote track:", event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
          console.log("Add a track to the remoteStream:", track);
          remoteStream.addTrack(track);
        });
      });

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

  useEffect(() => {
    peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("!!!! Got candidate: ", event.candidate);
    });

    peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`
      );
    });
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      rtc.call
    </div>
  );
};
