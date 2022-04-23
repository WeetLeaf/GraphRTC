import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { RTCAnswer } from "../components/RTC/rtc.answer";
import { RTCCall } from "../components/RTC/rtc.call";
import { useRTC } from "../contexts/rtc.context";
import { useRoom } from "../hooks/useRoom";

export default function Room() {
  const { isReady } = useRouter();
  return isReady ? <RoomReady /> : null;
}

const RoomReady = () => {
  const { identity, localStream } = useRTC();

  const [rtcOffers, setRtcOffers] = useState<string[]>([]);
  const [rtcAnswers, setRtcAnswers] = useState<RTCSessionDescriptionInit[]>([]);

  const localStreamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!localStream || !localStreamRef.current) return;
    localStreamRef.current.srcObject = localStream;
  }, [localStream]);

  useRoom({
    onOffer: (offer) => {
      setRtcAnswers((rtcAnswers) => [...rtcAnswers, offer]);
    },
    onParticipant: (participant) => {
      setRtcOffers((rtcOffers) => [...rtcOffers, participant]);
    },
  });
  return (
    <div>
      <div>{identity}</div>

      {localStream && (
        <video
          muted
          autoPlay
          playsInline
          ref={localStreamRef}
          height={100}
          width={100}
        />
      )}

      {rtcAnswers.map((answer, index) => (
        <RTCAnswer offer={answer} key={answer.sdp ?? index} />
      ))}
      {rtcOffers.map((user) => (
        <RTCCall userUuid={user} key={user} />
      ))}
    </div>
  );
};
