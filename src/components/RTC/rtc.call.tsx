import {
  gql,
  useApolloClient,
  useMutation,
  useSubscription,
} from "@apollo/client";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { configuration } from "../../config/rtc.config";
import { useRTC } from "../../contexts/rtc.context";
import { mapTypeOffer } from "../../utils/mapTypeOffer";
import {
  SendCallerCandidateMutation,
  SendCallerCandidateMutationVariables,
  SendOfferMutation,
  SendOfferMutationVariables,
  SubscribeToAnwserSubscription,
  SubscribeToAnwserSubscriptionVariables,
  SubscribeToCalleeCandidateSubscription,
  SubscribeToCalleeCandidateSubscriptionVariables,
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

const SEND_CANDIDATE = gql`
  mutation SendCallerCandidate(
    $iceCandidate: CandidateInput!
    $roomUuid: String!
    $offerSdp: String!
  ) {
    addIceCandidate(
      candidateType: CALLER
      iceCandidate: $iceCandidate
      offerSdp: $offerSdp
      roomUuid: $roomUuid
    )
  }
`;

const SUB_TO_CANDIDATE = gql`
  subscription SubscribeToCalleeCandidate(
    $offerSdp: String!
    $roomUuid: String!
  ) {
    subscribeToCandidate(
      candidateType: CALLEE
      offerSdp: $offerSdp
      roomUuid: $roomUuid
    ) {
      candidate
      sdpMLineIndex
      sdpMid
      usernameFragment
    }
  }
`;

export const RTCCall = (props: Props) => {
  const { query } = useRouter();
  const { current: peerConnection } = useRef(
    new RTCPeerConnection(configuration)
  );
  const { localStream } = useRTC();

  const [remoteStream] = useState(new MediaStream());

  const offerRef = useRef<RTCSessionDescriptionInit | null>(null);
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

  const [sendCandidate] = useMutation<
    SendCallerCandidateMutation,
    SendCallerCandidateMutationVariables
  >(SEND_CANDIDATE);

  const { data: onCallerCandidate } = useSubscription<
    SubscribeToCalleeCandidateSubscription,
    SubscribeToCalleeCandidateSubscriptionVariables
  >(SUB_TO_CANDIDATE);

  useEffect(() => {
    const data = onCallerCandidate?.subscribeToCandidate;
    if (!data) return;

    (async () => {
      await peerConnection.addIceCandidate(
        new RTCIceCandidate({
          candidate: data.candidate ?? undefined,
          sdpMLineIndex: data.sdpMLineIndex ?? undefined,
          sdpMid: data.sdpMid ?? undefined,
          usernameFragment: data.usernameFragment ?? undefined,
        })
      );
    })();
  }, [onCallerCandidate?.subscribeToCandidate]);

  const setAnswerListener = useCallback(() => {
    const { current: offer } = offerRef;
    if (!offer) return;

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
      console.log("CALL - Add a track to the localStream:");
      peerConnection.addTrack(track, localStream);
    });
  }, [localStream]);

  useEffect(() => {
    console.log("listen for tracks");
    peerConnection.addEventListener("track", (event) => {
      console.log("Got remote track:", event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        console.log("CALL - Add a track to the remoteStream:", track);
        remoteStream.addTrack(track);
      });
    });
  }, []);

  useEffect(() => {
    (async () => {
      let offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      offerRef.current = offer;
      setAnswerListener();
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
    if (!videoRef.current) return;
    console.log("Set remote stream to videoRef");
    videoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        console.log("Got final candidate!");
        return;
      }

      const data = event.candidate.toJSON();
      sendCandidate({
        variables: {
          roomUuid: query.uuid as string,
          offerSdp: offerRef.current!.sdp!,
          iceCandidate: data,
        },
      });
      console.log("!!!! Got candidate: ", data);
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
      <video ref={videoRef} autoPlay playsInline width={200} height={200} />
      rtc.call
    </div>
  );
};
