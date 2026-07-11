/// <reference types="vite/client" />

// Assets importados con ?url (Vite devuelve la URL final del archivo).
declare module '*.woff2?url' {
  const url: string;
  export default url;
}
