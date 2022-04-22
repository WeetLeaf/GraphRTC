import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import "../styles/global.css";

export const AppContext = dynamic(() => import("../contexts/app.context"), {
  ssr: false,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContext>
      <Component {...pageProps} />
    </AppContext>
  );
}

export default MyApp;
