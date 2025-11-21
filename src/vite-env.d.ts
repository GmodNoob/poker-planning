/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEAM_MEMBERS?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
