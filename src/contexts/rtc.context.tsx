import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react";
import { v4 } from "uuid";

type RTCContextType = {
  identity: string;
  localStream: MediaStream | undefined;
};

const RTCContext = createContext<RTCContextType>(undefined!);

export const useRTC = () => useContext(RTCContext);

export const RTCContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [identity] = useState(v4());

  const [localStream, setLocalStream] = useState<MediaStream>();

  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    })();
  }, []);

  return (
    <RTCContext.Provider value={{ identity, localStream }}>
      {children}
    </RTCContext.Provider>
  );
};
