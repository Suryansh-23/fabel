/* Simple structured logger with contextual fields */
export type LogFields = Record<string, unknown>;

function formatFields(fields?: LogFields): string {
  if (!fields || Object.keys(fields).length === 0) return "";
  try {
    return " " + JSON.stringify(fields);
  } catch {
    return "";
  }
}

export const logger = {
  info(msg: string, fields?: LogFields) {
    console.log(`[INFO] ${new Date().toISOString()} ${msg}${formatFields(fields)}`);
  },
  warn(msg: string, fields?: LogFields) {
    console.warn(`[WARN] ${new Date().toISOString()} ${msg}${formatFields(fields)}`);
  },
  error(msg: string, fields?: LogFields) {
    console.error(`[ERROR] ${new Date().toISOString()} ${msg}${formatFields(fields)}`);
  },
  debug(msg: string, fields?: LogFields) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${msg}${formatFields(fields)}`);
    }
  },
};

export default logger;

