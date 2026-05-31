import { getLogs, logInfo, redact } from "./logger";

describe("logger redaction", () => {
  it("redacts secrets and signatures from nested log payloads", () => {
    const result = redact({
      authorization: "Bearer secret",
      nested: {
        refresh_token: "refresh-secret",
        signature: "deadbeef",
      },
      safe: "ok",
    });

    expect(result).toEqual({
      authorization: "[REDACTED]",
      nested: {
        refresh_token: "[REDACTED]",
        signature: "[REDACTED]",
      },
      safe: "ok",
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
