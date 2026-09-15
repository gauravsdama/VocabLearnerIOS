import { getLogs, logInfo, redact } from "./logger";

describe("logger redaction", () => {
  it("redacts secrets and signatures from nested log payloads", () => {
    const result = redact({
      authorization: "Bearer secret",
      nested: {
        refresh_token: "refresh-secret",
        signature: "deadbeef",
        identity_token: "apple-token",
        authorization_code: "apple-code",
        new_password: "new-password",
      },
      safe: "ok",
      url: "/auth/verify-email?token=verify-token&code=123456",
    });

    expect(result).toEqual({
      authorization: "[REDACTED]",
      nested: {
        refresh_token: "[REDACTED]",
        signature: "[REDACTED]",
        identity_token: "[REDACTED]",
        authorization_code: "[REDACTED]",
        new_password: "[REDACTED]",
      },
      safe: "ok",
      url: "/auth/verify-email?token=%5BREDACTED%5D&code=%5BREDACTED%5D",
    });
  });

  it("stores redacted log entries", () => {
    logInfo("IOS_TEST", "log entry", {
      token: "secret-token",
      safe: "ok",
    });

    const latest = getLogs().at(-1);
    expect(latest?.data).toEqual({
      token: "[REDACTED]",
      safe: "ok",
    });
  });
});
