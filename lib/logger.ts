/**
 * JurisAI Centralized Logger Utility
 * Gated by NODE_ENV to reduce verbosity in production environments.
 */
const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  log: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (!isProduction) {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always preserve critical error logging for server monitoring & observability
    console.error(...args);
  },
};

export default logger;
