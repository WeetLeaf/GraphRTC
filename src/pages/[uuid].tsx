import { useRouter } from "next/router";
import React, { useState } from "react";
import { RTCAnswer } from "../components/RTC/rtc.answer";
import { RTCCall } from "../components/RTC/rtc.call";
import { useRTC } from "../contexts/rtc.context";
import { useRoom } from "../hooks/useRoom";

export default function Room() {
  const { isReady } = useRouter();
  return isReady ? <RoomReady /> : null;
}

const RoomReady = () => {
  const { identity } = useRTC();

  const [rtcOffers, setRtcOffers] = useState<string[]>([]);
  const [rtcAnswers, setRtcAnswers] = useState<RTCSessionDescriptionInit[]>([]);

  useRoom({
    onOffer: (offer) => {
      console.log("onOffer: ", offer);
      setRtcAnswers((rtcAnswers) => [...rtcAnswers, offer]);
    },
    onParticipant: (participant) => {
      console.log("onParticipant: ", participant);
      setRtcOffers((rtcOffers) => [...rtcOffers, participant]);
    },
  });
  return (
    <div>
      <div>{identity}</div>
      {rtcAnswers.map((answer, index) => (
        <RTCAnswer offer={answer} key={answer.sdp ?? index} />
      ))}
      {rtcOffers.map((user) => (
        <RTCCall userUuid={user} key={user} />
      ))}
    </div>
  );
};
