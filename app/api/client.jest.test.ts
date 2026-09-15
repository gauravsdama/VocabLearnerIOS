jest.mock("../utils/storage", () => ({
  clearAuthStorage: jest.fn(async () => {}),
  getAccessToken: jest.fn(() => null),
  getClientSigningKey: jest.fn(() => null),
}));

jest.mock("./signing", () => ({
  buildSignatureHeaders: jest.fn(async () => ({})),
}));

jest.mock("../config", () => ({
  iosAppConfig: {
    apiBaseUrl: "https://api.example.com",
  },
}));

import { apiFetch } from "./client";
import { getLogs } from "../utils/logger";

const latestApiRequestLog = (startIndex: number) =>
  getLogs()
    .slice(startIndex)
    .filter((entry) => entry.fe_log_id === "IOS_API_REQ")
    .at(-1);

describe("apiFetch logging", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("omits auth request bodies from request logs", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => null },
    } as any);
    const startIndex = getLogs().length;

    await apiFetch("/auth/apple", {
      method: "POST",
      body: JSON.stringify({
        identity_token: "identity-token",
        authorization_code: "authorization-code",
      }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(latestApiRequestLog(startIndex)?.data).toMatchObject({
      method: "POST",
      url: "https://api.example.com/api/v1/auth/apple",
      request: {
        body: "[OMITTED]",
      },
    });
  });

  it("redacts sensitive query parameters from logged URLs", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => null },
    } as any);
    const startIndex = getLogs().length;

    await apiFetch("/auth/verify-email?token=verify-token&code=123456");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const logEntry = latestApiRequestLog(startIndex);
    const loggedUrl = String(logEntry?.data?.url || "");

    expect(loggedUrl).toContain("token=%5BREDACTED%5D");
    expect(loggedUrl).toContain("code=%5BREDACTED%5D");
    expect(loggedUrl).not.toContain("verify-token");
    expect(loggedUrl).not.toContain("123456");
  });
});
