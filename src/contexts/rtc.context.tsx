import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { v4 } from "uuid";
import { configuration } from "../config/rtc.config";

type RTCContextType = {
  peerConnection: RTCPeerConnection;
  identity: string;
};

const RTCContext = createContext<RTCContextType>(undefined!);

export const useRTC = () => useContext(RTCContext);

export const RTCContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [peerConnection] = useState<RTCPeerConnection>(() => {
    return typeof window !== "undefined"
      ? new RTCPeerConnection(configuration)
      : undefined!;
  });

  const [identity] = useState(v4());

  return (
    <RTCContext.Provider value={{ peerConnection, identity }}>
      {children}
    </RTCContext.Provider>
  );
};
