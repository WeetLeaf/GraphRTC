import { AppProps } from "next/app";
import { AppContext } from "../contexts/app.context";
import "../styles/global.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContext>
      <Component {...pageProps} />
    </AppContext>
  );
}

export default MyApp;
