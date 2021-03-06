import { useMutation } from "@apollo/client";
import { useToast } from "@chakra-ui/react";
import { gql } from "apollo-server-core";
import { useRouter } from "next/router";
import React from "react";
import {
  CreateRoomMutation,
  CreateRoomMutationVariables,
} from "../../__generated__/grahql";

const CREATE_ROOM = gql`
  mutation CreateRoom {
    room: createRoom(name: "test") {
      uuid
    }
  }
`;

export const CreateRoom = () => {
  const { push } = useRouter();

  const toast = useToast();

  const [createRoom, { loading }] = useMutation<
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
        createRoom();
      }}
    >
      <span>{loading ? "Creating room..." : "Create room"}</span>
    </button>
  );
};
