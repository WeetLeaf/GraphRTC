import { Text } from "@chakra-ui/react";
import { CreateRoom } from "../components/buttons/CreateRoom";
import { JoinRoom } from "../components/buttons/JoinRoom";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-1/2 left-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-4  grid grid-cols-2 rounded-md shadow shadow-white/30 ring-white/50 ring-1 divide-x">
          <div className="text-center text-white font-semibold pr-4 space-y-8">
            <Text fontSize="2xl">Create a new room</Text>
            <CreateRoom />
          </div>
          <div className="text-center text-white font-semibold pl-4 space-y-8">
            <Text fontSize="2xl">Join a room</Text>
            <JoinRoom />
          </div>
        </div>
      </div>
    </div>
  );
}
