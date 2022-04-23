import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { configuration } from "../../config/rtc.config";
import { useRTC } from "../../contexts/rtc.context";
import { mapTypeOffer } from "../../utils/mapTypeOffer";
import {
  SendAnswerMutation,
  SendAnswerMutationVariables,
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
      <video ref={videoRef} autoPlay playsInline />
      rtc.answer
    </div>
  );
};
