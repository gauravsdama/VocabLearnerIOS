type LogLevel = "info" | "warn" | "error";

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  fe_log_id: string;
  message: string;
  data?: Record<string, unknown>;
};

const MAX_LOGS = 200;
const logEntries: LogEntry[] = [];
const listeners = new Set<(entries: LogEntry[]) => void>();

const SENSITIVE_KEYS = new Set([
  "authorization",
  "password",
  "access_token",
  "refresh_token",
  "token",
  "phone_e164",
  "client_signing_key",
  "x-client-signature",
  "x-client-nonce",
  "signature",
  "secret"
]);

const SENSITIVE_QUERY_FRAGMENTS = [
  "token",
  "password",
  "credential",
  "authorization",
  "code",
  "key",
  "secret",
  "signature"
];

const looksSensitiveCodeKey = (normalized: string) => {
  return (
    normalized === "code" ||
    normalized.endsWith("_code") ||
    normalized.includes("authorization_code") ||
    normalized.includes("verification_code") ||
    normalized.includes("one_time_code")
  );
};

const looksSensitiveKeyKey = (normalized: string) => {
  return (
    normalized === "key" ||
    normalized.endsWith("_key") ||
    normalized.includes("api_key") ||
    normalized.includes("signing_key")
  );
};

const shouldRedactKey = (key: string) => {
  const normalized = key.toLowerCase();
  return (
    SENSITIVE_KEYS.has(normalized) ||
    normalized.includes("token") ||
    normalized.includes("password") ||
    normalized.includes("credential") ||
    normalized.includes("authorization") ||
    normalized.includes("signature") ||
    normalized.includes("secret") ||
    looksSensitiveCodeKey(normalized) ||
    looksSensitiveKeyKey(normalized)
  );
};

const shouldRedactQueryKey = (key: string) => {
  const normalized = key.toLowerCase();
  return (
    SENSITIVE_QUERY_FRAGMENTS.some((fragment) => normalized.includes(fragment)) ||
    looksSensitiveCodeKey(normalized) ||
    looksSensitiveKeyKey(normalized)
  );
};

const redactUrl = (value: string) => {
  if (!value.includes("?")) {
    return value;
  }
  try {
    const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
    const parsed = new URL(value, "https://redaction.local");
    parsed.searchParams.forEach((paramValue, key) => {
      if (shouldRedactQueryKey(key) && paramValue) {
        parsed.searchParams.set(key, "[REDACTED]");
      }
    });
    if (isAbsolute) {
      return parsed.toString();
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return value;
  }
};

export const redact = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (shouldRedactKey(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redact(val);
      }
    });
    return result;
  }
  if (typeof value === "string" && value.startsWith("Bearer ")) {
    return "Bearer [REDACTED]";
  }
  if (typeof value === "string") {
    return redactUrl(value);
  }
  return value;
};

const pushEntry = (entry: LogEntry) => {
  logEntries.push(entry);
  if (logEntries.length > MAX_LOGS) {
    logEntries.splice(0, logEntries.length - MAX_LOGS);
  }
  const snapshot = [...logEntries];
  listeners.forEach((listener) => listener(snapshot));
};

const logWithLevel = (level: LogLevel, id: string, msg: string, data?: Record<string, unknown>) => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    fe_log_id: id,
    message: msg,
    data: data ? (redact(data) as Record<string, unknown>) : undefined
  };

  const line = `[FE_LOG_ID:${id}] ${msg}`;
  if (level === "error") {
    console.error(line, entry.data);
  } else if (level === "warn") {
    console.warn(line, entry.data);
  } else {
    console.log(line, entry.data);
  }

  pushEntry(entry);
};

export const logInfo = (id: string, msg: string, data?: Record<string, unknown>) => {
  logWithLevel("info", id, msg, data);
};

export const logWarn = (id: string, msg: string, data?: Record<string, unknown>) => {
  logWithLevel("warn", id, msg, data);
};

export const logError = (id: string, msg: string, data?: Record<string, unknown>) => {
  logWithLevel("error", id, msg, data);
};

export const getLogs = () => [...logEntries];

export const subscribeLogs = (listener: (entries: LogEntry[]) => void) => {
  listeners.add(listener);
  listener([...logEntries]);
  return () => {
    listeners.delete(listener);
  };
};

export const generateRequestId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
};
