import { Input } from "@chakra-ui/react";
import { gql } from "apollo-server-core";
import { useRTC } from "../../contexts/rtc.context";

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

export const JoinRoom = () => {
  const { peerConnection } = useRTC();

  return (
    <div className="space-y-2">
      <Input placeholder="Room ID" bg="white" textColor="blackAlpha.800" />
      <button
        className="bg-white text-indigo-500 px-4 py-2 w-full rounded-md font-semibold"
        onClick={async () => {
          console.log("Join room");
          let answer = await peerConnection.createAnswer();
          console.log(answer);
        }}
      >
        Join room
      </button>
    </div>
  );
};
