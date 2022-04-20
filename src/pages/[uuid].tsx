import { useEffect } from "react";
import { useRTC } from "../contexts/rtc.context";

export default function Room() {
  const { peerConnection } = useRTC();

  const createOffer = async () => {
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Created offer:", offer);

    peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("Got candidate: ", event.candidate);
    });
  };

  useEffect(() => {
    createOffer();
  }, []);

  return <div>Room</div>;
}
