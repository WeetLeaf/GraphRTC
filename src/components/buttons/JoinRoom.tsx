import { useLazyQuery } from "@apollo/client";
import { Input, useToast } from "@chakra-ui/react";
import { gql } from "apollo-server-core";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRTC } from "../../contexts/rtc.context";
import {
  GetRoomQuery,
  GetRoomQueryVariables,
  Offer,
} from "../../__generated__/grahql";
import { mapTypeOffer } from "./CreateRoom";

const GET_ROOM = gql`
  query GetRoom($uuid: String!) {
    room: room(uuid: $uuid) {
      uuid
      participants {
        uuid
        name
      }
      offer {
        type
        sdp
      }
    }
  }
`;

type FormType = {
  uuid: string;
};

export const JoinRoom = () => {
  const { isReady } = useRouter();

  const { peerConnection } = useRTC();

  const toast = useToast();

  const form = useForm<FormType>();

  const [getRoom, { data, error }] = useLazyQuery<
    GetRoomQuery,
    GetRoomQueryVariables
  >(GET_ROOM);

  const getOffer = useCallback(async () => {
    if (!data) return;
    if (!data?.room) {
      toast.closeAll();
      toast({
        title: "Error",
        description: "Room not found",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    const { offer } = data.room;

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(mapOffer(offer))
    );

    const answer = await peerConnection.createAnswer();
    console.log("Created answer:", answer);
    await peerConnection.setLocalDescription(answer);
  }, [data]);

  useEffect(() => {
    getOffer();
  }, [getOffer]);

  console.log(data, error);

  return (
    <div className="space-y-2">
      <Input
        placeholder="Room ID"
        bg="white"
        textColor="blackAlpha.800"
        {...form.register("uuid")}
      />
      <button
        className="bg-white text-indigo-500 px-4 py-2 w-full rounded-md font-semibold"
        onClick={async () => {
          if (isReady) {
            const uuid = form.getValues("uuid");
            getRoom({ variables: { uuid: uuid } });
          }
        }}
      >
        Join room
      </button>
    </div>
  );
};

const mapOffer = (offer: Offer): RTCSessionDescriptionInit => {
  return {
    type: mapTypeOffer(offer.type),
    sdp: offer.sdp ?? undefined,
  };
};
