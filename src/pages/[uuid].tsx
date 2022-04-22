import { useRouter } from "next/router";
import { useRoom } from "../hooks/useRoom";

export default function Room() {
  const { isReady } = useRouter();
  return isReady ? <RoomReady /> : null;
}

const RoomReady = () => {
  const { isReady } = useRouter();
  useRoom();
  return <div>{isReady ? "Ready" : "Not ready"}</div>;
};
