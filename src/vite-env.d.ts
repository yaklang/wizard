/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BYPASS_LICENSE?: string
  readonly VITE_AUTO_LOGIN_USERNAME?: string
  readonly VITE_AUTO_LOGIN_PASSWORD?: string
  readonly VITE_AUTO_LOGIN_PASSWORD_B64?: string
  readonly VITE_AUTO_LOGIN_CODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
