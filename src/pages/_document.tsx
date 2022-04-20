import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body className="text-gray-800 font-Roboto overflow-y-scroll max-w-screen">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
