import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { configuration } from "../../config/rtc.config";
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

  const [sendAnswer] = useMutation<
    SendAnswerMutation,
    SendAnswerMutationVariables
  >(SEND_ANSWER);

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
      console.log("Created answer:", answer);
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

  return <div>rtc.answer</div>;
};
