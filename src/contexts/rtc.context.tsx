import React, { createContext, useContext, useState } from "react";
import { configuration } from "../config/rtc.config";

type RTCContextType = {
  peerConnection: RTCPeerConnection | null;
};

const RTCContext = createContext<RTCContextType>(undefined!);

export const useRTC = () => useContext(RTCContext);

export const RTCContextProvider = () => {
  const [peerConnection] = useState<RTCPeerConnection>(() => {
    return new RTCPeerConnection(configuration);
  });

  return (
    <RTCContext.Provider value={{ peerConnection }}>
      RTCContextProvider
    </RTCContext.Provider>
  );
};
