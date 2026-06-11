export const STREAM_CONFIG = {
  // Defaulting to the environment variable if available, else standard fallback
  ACTIVE_DOMAIN: import.meta.env.VITE_STREAM_DOMAIN || "",
};
