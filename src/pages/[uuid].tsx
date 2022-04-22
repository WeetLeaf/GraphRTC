import { useRouter } from "next/router";
import { useRTC } from "../contexts/rtc.context";
import { useRoom } from "../hooks/useRoom";

export default function Room() {
  const { isReady } = useRouter();
  return isReady ? <RoomReady /> : null;
}

const RoomReady = () => {
  const { identity } = useRTC();
  useRoom();
  return <div>{identity}</div>;
};
