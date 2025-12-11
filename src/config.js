// Central configuration for the application
export const COMPETITION_ID = import.meta.env.VITE_COMPETITION_ID || (() => { throw new Error('VITE_COMPETITION_ID environment variable is required'); })();
