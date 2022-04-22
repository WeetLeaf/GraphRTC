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

  useEffect(() => {
    peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`
      );
    });
  }, []);

  return (
    <RTCContext.Provider value={{ peerConnection, identity }}>
      {children}
    </RTCContext.Provider>
  );
};
