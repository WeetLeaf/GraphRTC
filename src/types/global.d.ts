// Add custom env variables to NodeJS
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_ENDPOINT: string;
    NEXT_PUBLIC_API_WEBSOCKET_ENDPOINT: string;
  }
}
