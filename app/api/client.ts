import { ApiErrorPayload } from "./types";
import { generateRequestId, logError, logInfo, redact } from "../utils/logger";
import {
  clearAuthStorage,
  getAccessToken,
  getClientSigningKey,
} from "../utils/storage";
import { buildSignatureHeaders } from "./signing";
import { iosAppConfig } from "../config";

const API_PREFIX = "/api/v1";
const DEFAULT_API_BASE_URL = "https://vocab-backend-219277558905.us-central1.run.app";

const resolveApiBaseUrl = () => {
  const raw = iosAppConfig.apiBaseUrl;
  const selected = raw && raw.length > 0 ? raw : DEFAULT_API_BASE_URL;
  let normalized = selected.replace(/\/+$/, "");
  if (normalized.endsWith(API_PREFIX)) {
    normalized = normalized.slice(0, -API_PREFIX.length);
  }
  return normalized.replace(/\/+$/, "");
};

const baseUrl = resolveApiBaseUrl();

let onUnauthorized: (() => void) | null = null;
let onRefreshToken: (() => Promise<boolean>) | null = null;

type RequestBehavior = {
  omitAuth?: boolean;
  skipAuthRefresh?: boolean;
};

export class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;
  requestId?: string;
  status: number;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    status: number,
    code = "unknown",
    details?: Record<string, unknown>,
    requestId?: string,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

export const setRefreshHandler = (handler: (() => Promise<boolean>) | null) => {
  onRefreshToken = handler;
};

const normalizeApiPath = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === API_PREFIX) {
    return "/";
  }
  if (normalized.startsWith(`${API_PREFIX}/`)) {
    return normalized.slice(API_PREFIX.length);
  }
  return normalized;
};

const buildUrl = (path: string) => {
  const normalized = normalizeApiPath(path);
  return `${baseUrl}${API_PREFIX}${normalized}`;
};

const normalizeHeaders = (headers?: HeadersInit) => {
  const result: Record<string, string> = {};
  if (!headers) {
    return result;
  }
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      result[key] = value;
    });
    return result;
  }
  return { ...(headers as Record<string, string>) };
};

const shouldOmitRequestBodyFromLogs = (path: string) => {
  const normalized = normalizeApiPath(path);
  return normalized.startsWith("/auth/");
};

const sanitizeLogUrl = (url: string) => {
  const sanitized = redact(url);
  return typeof sanitized === "string" ? sanitized : url;
};

const sanitizeBody = (path: string, body?: BodyInit | null) => {
  if (!body) {
    return undefined;
  }
  if (shouldOmitRequestBodyFromLogs(path)) {
    return "[OMITTED]";
  }
  if (typeof body === "string") {
    try {
      return redact(JSON.parse(body));
    } catch {
      return body.length > 200 ? `${body.slice(0, 200)}...` : body;
    }
  }
  return "[Body]";
};

const getRetryAfterSeconds = (response: Response, details?: Record<string, unknown>) => {
  const headerValue = response.headers.get("retry-after");
  if (headerValue) {
    const parsed = Number(headerValue);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  const detailValue = details?.retry_after_seconds ?? details?.retryAfterSeconds;
  if (typeof detailValue === "number" && Number.isFinite(detailValue)) {
    return detailValue;
  }
  if (typeof detailValue === "string") {
    const parsed = Number(detailValue);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const parseError = async (response: Response) => {
  const requestIdHeader = response.headers.get("x-request-id") || undefined;
  try {
    const data = (await response.json()) as ApiErrorPayload;
    if (data?.error) {
      const retryAfterSeconds = getRetryAfterSeconds(response, data.error.details);
      return new ApiError(
        data.error.message,
        response.status,
        data.error.code,
        data.error.details,
        data.error.request_id || requestIdHeader,
        retryAfterSeconds
      );
    }
  } catch {
    // fall through
  }
  return new ApiError(
    response.statusText || "Request failed",
    response.status,
    "unknown",
    undefined,
    requestIdHeader,
    getRetryAfterSeconds(response)
  );
};

type LogIds = {
  startId?: string;
  okId?: string;
  failId?: string;
  eventId?: string;
};

export async function apiPing(logIds?: LogIds) {
  const url = `${baseUrl}/health`;
  const startTime = Date.now();
  logInfo("IOS_API_PING_START", "Health check started", { url });
  if (logIds?.startId) {
    logInfo(logIds.startId, "Health check started", { url });
  }
  try {
    const response = await fetch(url, { method: "GET" });
    const duration = Date.now() - startTime;
    const payload = {
      url,
      status: response.status,
      duration_ms: duration
    };
    if (response.ok) {
      logInfo("IOS_API_PING_OK", "Health check ok", payload);
      if (logIds?.okId) {
        logInfo(logIds.okId, "Health check ok", payload);
      }
      return true;
    }
    logError("IOS_API_PING_FAIL", "Health check failed", payload);
    if (logIds?.failId) {
      logError(logIds.failId, "Health check failed", payload);
    }
    return false;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const payload = {
      url,
      status: null,
      duration_ms: duration,
      error_message: error?.message || "Network error"
    };
    logError("IOS_API_PING_FAIL", "Health check failed", payload);
    if (logIds?.failId) {
      logError(logIds.failId, "Health check failed", payload);
    }
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  logIds?: LogIds,
  behavior: RequestBehavior = {}
): Promise<T> {
  const clientRequestId = generateRequestId();
  const startTime = Date.now();
  const hasBody = options.body !== undefined && options.body !== null;
  const method = (options.method || "GET").toUpperCase();
  const token = behavior.omitAuth ? null : getAccessToken();
  const signingKey = getClientSigningKey();
  const shouldSign = Boolean(token && signingKey) && method !== "GET" && method !== "HEAD";
  const bodyText = typeof options.body === "string" ? options.body : "";
  const signatureHeaders = shouldSign && signingKey
    ? await buildSignatureHeaders({
        method,
        url: buildUrl(path),
        bodyText,
        signingKey
      })
    : {};
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined)
  };

  headers.Accept = "application/json";

  if (hasBody && !("Content-Type" in headers) && !("content-type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  Object.assign(headers, signatureHeaders);

  const url = buildUrl(path);
  const sanitizedUrl = sanitizeLogUrl(url);
  const sanitizedHeaders = redact(normalizeHeaders(headers));
  const sanitizedBody = sanitizeBody(path, options.body);
  const requestLogData = {
    client_request_id: clientRequestId,
    server_request_id: null,
    method,
    url: sanitizedUrl,
    status: null,
    duration_ms: null,
    request: {
      headers: sanitizedHeaders,
      body: sanitizedBody
    }
  };

  logInfo("IOS_API_REQ", "Request started", requestLogData);
  if (logIds?.startId) {
    logInfo(logIds.startId, "Request started", requestLogData);
  }

  let didLogError = false;

  try {
    const response = await fetch(url, {
      ...options,
      method,
      headers
    });

    const duration = Date.now() - startTime;
    const serverRequestId = response.headers.get("x-request-id") || null;
    const responseLogData = {
      client_request_id: clientRequestId,
      server_request_id: serverRequestId,
      method,
      url: sanitizedUrl,
      status: response.status,
      duration_ms: duration
    };

    if (!response.ok) {
      const apiError = await parseError(response);
      const isSignatureError = String(apiError.code || "").toUpperCase().startsWith("SIGNATURE_");
      const canRefresh =
        response.status === 401 &&
        !isSignatureError &&
        !behavior.omitAuth &&
        !behavior.skipAuthRefresh &&
        path !== "/auth/refresh" &&
        Boolean(onRefreshToken);

      if (canRefresh && onRefreshToken) {
        const refreshed = await onRefreshToken();
        if (refreshed) {
          return apiFetch<T>(path, options, logIds, {
            ...behavior,
            skipAuthRefresh: true
          });
        }
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          await clearAuthStorage();
        }
      } else if (response.status === 401 && !isSignatureError && !behavior.omitAuth) {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          await clearAuthStorage();
        }
      }
      const errorLogData = {
        ...responseLogData,
        server_request_id: apiError.requestId || serverRequestId,
        error_code: apiError.code,
        error_message: apiError.message,
        error_details: apiError.details,
        retry_after_seconds: apiError.retryAfterSeconds
      };
      logError("IOS_API_ERR", "Request failed", errorLogData);
      if (logIds?.failId) {
        logError(logIds.failId, "Request failed", errorLogData);
      }
      if (logIds?.eventId) {
        logError(logIds.eventId, "Request failed", errorLogData);
      }
      didLogError = true;
      throw apiError;
    }

    logInfo("IOS_API_RES", "Request completed", responseLogData);
    if (logIds?.okId) {
      logInfo(logIds.okId, "Request completed", responseLogData);
    }
    if (logIds?.eventId) {
      logInfo(logIds.eventId, "Request completed", responseLogData);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  } catch (error: any) {
    if (!didLogError) {
      const duration = Date.now() - startTime;
      const errorLogData = {
        client_request_id: clientRequestId,
        server_request_id: error?.requestId || null,
        method,
        url: sanitizedUrl,
        status: error?.status ?? null,
        duration_ms: duration,
        error_code: error?.code,
        error_message: error?.message || "Network error",
        error_details: error?.details,
        retry_after_seconds: error?.retryAfterSeconds
      };
      logError("IOS_API_ERR", "Request failed", errorLogData);
      if (logIds?.failId) {
        logError(logIds.failId, "Request failed", errorLogData);
      }
      if (logIds?.eventId) {
        logError(logIds.eventId, "Request failed", errorLogData);
      }
    }
    throw error;
  }
}
