/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_BYPASS_LICENSE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
