import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";
const defaultLevel = process.env.LOG_LEVEL || (isDev ? "debug" : "info");

export const logger = pino({
  level: defaultLevel,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
