import { Input } from "@chakra-ui/react";
import React from "react";

export const JoinRoom = () => {
  return (
    <div className="space-y-2">
      <Input placeholder="Room ID" bg="white" />
      <button className="bg-white text-indigo-500 px-4 py-2 w-full rounded-md font-semibold">
        Join room
      </button>
    </div>
  );
};
