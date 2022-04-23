import { useRouter } from "next/router";
import React from "react";

type Props = {
  offer: RTCSessionDescriptionInit;
};

export const RTCAnswer = (props: Props) => {
  const { query } = useRouter();

  console.log("RTCAnswer: ", props);

  return <div>rtc.answer</div>;
};
