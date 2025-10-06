// Environment configuration
export const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://apiwh.ph.town/",
    NODE_ENV: import.meta.env.NODE_ENV || "development",
} as const;

export default config;
