import { gql, useMutation, useSubscription } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "react-use";
import { configuration } from "../../config/rtc.config";
import { useRTC } from "../../contexts/rtc.context";
import { mapTypeOffer } from "../../utils/mapTypeOffer";
import {
  SendAnswerMutation,
  SendAnswerMutationVariables,
  SendCalleeCandidateMutation,
  SendCalleeCandidateMutationVariables,
  SubscribeToCallerCandidateSubscription,
  SubscribeToCallerCandidateSubscriptionVariables,
} from "../../__generated__/grahql";
import { RTCCommonType } from "./type";

type Props = RTCCommonType & {
  offer: RTCSessionDescriptionInit;
};

const SEND_ANSWER = gql`
  mutation SendAnswer(
    $answer: OfferInput!
    $roomUuid: String!
    $offerSdp: String!
  ) {
    sendOfferAnswer(answer: $answer, offerSdp: $offerSdp, roomUuid: $roomUuid)
  }
`;

const SEND_CANDIDATE = gql`
  mutation SendCalleeCandidate(
    $iceCandidate: [CandidateInput!]!
    $roomUuid: String!
    $offerSdp: String!
  ) {
    addIceCandidates(
      candidateType: CALLEE
      iceCandidates: $iceCandidate
      offerSdp: $offerSdp
      roomUuid: $roomUuid
    )
  }
`;

const SUB_TO_CANDIDATE = gql`
  subscription SubscribeToCallerCandidate(
    $offerSdp: String!
    $roomUuid: String!
  ) {
    subscribeToCandidate(
      candidateType: CALLER
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

export const RTCAnswer = (props: Props) => {
  const { query } = useRouter();
  const { current: peerConnection } = useRef(
    new RTCPeerConnection(configuration)
  );

  const [candidateBulk, setCandidateBulk] = useState<RTCIceCandidateInit[]>([]);

  const { localStream } = useRTC();

  const videoRef = useRef<HTMLVideoElement>(null);

  const [sendAnswer] = useMutation<
    SendAnswerMutation,
    SendAnswerMutationVariables
  >(SEND_ANSWER);

  const [sendCandidate] = useMutation<
    SendCalleeCandidateMutation,
    SendCalleeCandidateMutationVariables
  >(SEND_CANDIDATE);

  useDebounce(
    () => {
      if (!!!candidateBulk.length) return;
      sendCandidate({
        variables: {
          roomUuid: query.uuid as string,
          offerSdp: props.offer.sdp!,
          iceCandidate: candidateBulk,
        },
      });
    },
    500,
    [candidateBulk]
  );

  const [remoteStream] = useState(new MediaStream());

  const { data: onCallerCandidate } = useSubscription<
    SubscribeToCallerCandidateSubscription,
    SubscribeToCallerCandidateSubscriptionVariables
  >(SUB_TO_CANDIDATE, {
    variables: {
      offerSdp: props.offer.sdp!,
      roomUuid: query.uuid as string,
    },
  });

  useEffect(() => {
    if (!peerConnection.remoteDescription) return;
    const datas = onCallerCandidate?.subscribeToCandidate;
    if (!datas) return;

    (async () => {
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
    })();
  }, [onCallerCandidate?.subscribeToCandidate]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = remoteStream;
  }, []);

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
    peerConnection.addEventListener("track", (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream?.addTrack(track);
      });
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
    (async () => {
      if (!props.offer.sdp) {
        console.error("No offer sdp");
        return;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(props.offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      sendAnswer({
        variables: {
          offerSdp: props.offer.sdp,
          roomUuid: query.uuid as string,
          answer: {
            sdp: answer.sdp,
            type: mapTypeOffer(answer.type!),
          },
        },
      });
    })();
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
