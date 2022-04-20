declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    EXPO_TOKEN: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER?: string;
    SMTP_PASSWORD?: string;
    SMTP_FROM?: string;
    SMTP_FROM_NAME?: string;
    BACKOFFICE_ACTIVATE: string;
    PLANNING_START_TIME: string;
    PLANNING_END_TIME: string;
  }
}
