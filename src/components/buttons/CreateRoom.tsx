import { useMutation } from "@apollo/client";
import { useToast } from "@chakra-ui/react";
import { gql } from "apollo-server-core";
import { useRouter } from "next/router";
import React from "react";
import { useRTC } from "../../contexts/rtc.context";
import {
  CreateRoomMutation,
  CreateRoomMutationVariables,
  Offer,
  RtcSdpType,
} from "../../__generated__/grahql";

const CREATE_ROOM = gql`
  mutation CreateRoom($offer: OfferInput!) {
    room: createRoom(name: "test", offer: $offer) {
      uuid
    }
  }
`;

export const CreateRoom = () => {
  const { push } = useRouter();

  const toast = useToast();

  const { peerConnection } = useRTC();

  const [createRoom, { data, loading, error }] = useMutation<
    CreateRoomMutation,
    CreateRoomMutationVariables
  >(CREATE_ROOM, {
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
    onCompleted: (data) => {
      push(`/${data.room.uuid}`);
    },
  });

  return (
    <button
      className="bg-white text-indigo-500 px-4 py-2 w-full rounded-md font-semibold"
      onClick={async () => {
        let off = await peerConnection.createOffer();

        let offer: Offer = {
          type: mapTypeOffer(off.type),
          sdp: off.sdp,
        };

        createRoom({ variables: { offer } });
      }}
    >
      <span>{loading ? "Creating room..." : "Create room"}</span>
    </button>
  );
};

export const mapTypeOffer = (type: RTCSdpType): RtcSdpType => {
  switch (type) {
    case "offer":
      return RtcSdpType.Offer;
    case "answer":
      return RtcSdpType.Answer;
    case "pranswer":
      return RtcSdpType.Pranswer;
    case "rollback":
      return RtcSdpType.Rollback;
  }
};
