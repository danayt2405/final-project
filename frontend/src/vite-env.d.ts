/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_APP_ENV?: 'development' | 'production' | 'test'
  // add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
