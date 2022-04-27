import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { RTCAnswer } from "../components/RTC/rtc.answer";
import { RTCCall } from "../components/RTC/rtc.call";
import { RTCContextProvider, useRTC } from "../contexts/rtc.context";
import { useRoom } from "../hooks/useRoom";

export default function Room() {
  const { isReady } = useRouter();
  return isReady ? (
    <RTCContextProvider>
      <RoomReady />
    </RTCContextProvider>
  ) : null;
}

const RoomReady = () => {
  const { localStream } = useRTC();

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
    <div className="grid grid-cols-3 gap-1 p-4">
      {localStream && (
        <video
          muted
          autoPlay
          playsInline
          ref={localStreamRef}
          className="bg-gray-300 ring w-full"
        />
      )}

      {rtcAnswers.map((answer) => (
        <RTCAnswer
          offer={answer}
          key={answer.sdp!}
          onDisconnect={() => {
            setRtcAnswers((rtcAnswers) =>
              rtcAnswers.filter((answ) => answ.sdp! !== answer.sdp!)
            );
          }}
        />
      ))}
      {rtcOffers.map((user) => (
        <RTCCall
          userUuid={user}
          key={user}
          onDisconnect={() => {
            setRtcOffers((offers) => offers.filter((offer) => offer !== user));
          }}
        />
      ))}
    </div>
  );
};
