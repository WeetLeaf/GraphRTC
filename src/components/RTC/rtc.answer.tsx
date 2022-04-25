import { gql, useMutation, useSubscription } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
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

type Props = {
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
    $iceCandidate: CandidateInput!
    $roomUuid: String!
    $offerSdp: String!
  ) {
    addIceCandidate(
      candidateType: CALLEE
      iceCandidate: $iceCandidate
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
    const data = onCallerCandidate?.subscribeToCandidate;
    if (!data) return;
    console.log("Received caller candidate: ", data);

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

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = remoteStream;
  }, []);

  useEffect(() => {
    peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        // console.log("Got final candidate!");
        return;
      }
      const data = event.candidate.toJSON();
      sendCandidate({
        variables: {
          roomUuid: query.uuid as string,
          offerSdp: props.offer.sdp!,
          iceCandidate: data,
        },
      });
      // console.log("!!!! Got candidate: ", data);
    });

    // peerConnection.addEventListener("icegatheringstatechange", () => {
    //   console.log(
    //     `ICE gathering state changed: ${peerConnection.iceGatheringState}`
    //   );
    // });

    // peerConnection.addEventListener("connectionstatechange", () => {
    //   console.log(`Connection state change: ${peerConnection.connectionState}`);
    // });

    // peerConnection.addEventListener("signalingstatechange", () => {
    //   console.log(`Signaling state change: ${peerConnection.signalingState}`);
    // });

    // peerConnection.addEventListener("iceconnectionstatechange ", () => {
    //   console.log(
    //     `ICE connection state change: ${peerConnection.iceConnectionState}`
    //   );
    // });
  }, []);

  useEffect(() => {
    peerConnection.addEventListener("track", (event) => {
      // console.log("Got remote track:", event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        // console.log("ANSWER - Add a track to the remoteStream:", track);
        remoteStream?.addTrack(track);
      });
    });
  }, []);

  useEffect(() => {
    if (!localStream) return;
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
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
            type: mapTypeOffer(answer.type),
          },
        },
      });
    })();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width={200}
        height={200}
        className="bg-red-300"
      />
      rtc.answer
    </div>
  );
};
