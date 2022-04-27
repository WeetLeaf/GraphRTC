import { gql, useApolloClient, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "react-use";
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

type Props = RTCCommonType & {
  userUuid: string;
};

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
    $iceCandidate: [CandidateInput!]!
    $roomUuid: String!
    $offerSdp: String!
  ) {
    addIceCandidates(
      candidateType: CALLER
      iceCandidates: $iceCandidate
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
  const [candidateBulk, setCandidateBulk] = useState<RTCIceCandidateInit[]>([]);

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

  useDebounce(
    () => {
      if (!!!candidateBulk.length) return;
      sendCandidate({
        variables: {
          roomUuid: query.uuid as string,
          offerSdp: offerRef.current!.sdp!,
          iceCandidate: candidateBulk,
        },
      });
    },
    500,
    [candidateBulk]
  );

  const setCandidateListener = useCallback(
    (offer: RTCSessionDescriptionInit) => {
      const subscription = apollo.subscribe<
        SubscribeToCalleeCandidateSubscription,
        SubscribeToCalleeCandidateSubscriptionVariables
      >({
        query: SUB_TO_CANDIDATE,
        variables: {
          offerSdp: offer.sdp!,
          roomUuid: query.uuid as string,
        },
      });

      subscription.subscribe(async (res) => {
        if (!peerConnection.remoteDescription) return;
        const datas = res.data?.subscribeToCandidate;
        if (!datas) return;

        for (const data of datas) {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate({
              candidate: data.candidate ?? undefined,
              sdpMLineIndex: data.sdpMLineIndex ?? undefined,
              sdpMid: data.sdpMid ?? undefined,
              usernameFragment: data.usernameFragment ?? undefined,
            })
          );
        }
      });
    },
    []
  );

  const setAnswerListener = useCallback((offer: RTCSessionDescriptionInit) => {
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

    const listener = subscription.subscribe(async (res) => {
      const data = res.data?.subscribeToAnswers;
      if (!data) return;

      const rtcSessionDescription = new RTCSessionDescription({
        type: data.type,
        sdp: data.sdp ?? undefined,
      });
      await peerConnection.setRemoteDescription(rtcSessionDescription);

      listener.unsubscribe();
    });
  }, []);

  useEffect(() => {
    if (!localStream) return;
    localStream.getTracks().forEach((track) => {
      try {
        // Prevent errorn on HMR
        peerConnection.addTrack(track, localStream);
      } catch (e) {
        console.error(e);
      }
    });
  }, [localStream]);

  useEffect(() => {
    peerConnection.addEventListener("track", (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    });
  }, []);

  useEffect(() => {
    (async () => {
      let offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      offerRef.current = offer;
      setCandidateListener(offer);
      setAnswerListener(offer);
      setTimeout(() => {
        sendOffer({
          variables: {
            offer: { type: mapTypeOffer(offer.type!), sdp: offer.sdp },
            room: query.uuid as string,
            user: props.userUuid,
          },
        });
      }, 1000);
    })();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        return;
      }

      const data = event.candidate.toJSON();
      setCandidateBulk((prev) => [...prev, data]);
    });
  }, []);

  useEffect(() => {
    peerConnection.addEventListener("iceconnectionstatechange", () => {
      if (peerConnection.iceConnectionState === "disconnected") {
        props.onDisconnect();
      }
    });
  }, []);

  return <video ref={videoRef} autoPlay playsInline className="bg-gray-200" />;
};
