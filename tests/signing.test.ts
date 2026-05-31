import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSignatureHeaders } from "../app/api/signing";
import { hmacSha256Hex, sha256Hex } from "../app/utils/sha256";

describe("iOS signing", () => {
  it("matches known SHA-256 and HMAC vectors", () => {
    assert.equal(
      sha256Hex("{\"foo\":\"bar\"}"),
      "7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b"
    );
    assert.equal(
      hmacSha256Hex("secret-key", "payload"),
      "10aa2e1c2538464ff75f0647271e3ba746bca3fcdeaf322c581bf5851e8cddb7"
    );
  });

  it("builds deterministic signature headers without Web Crypto", async () => {
    const headers = await buildSignatureHeaders({
      method: "POST",
      url: "https://example.com/api/v1/sentence/submit",
      bodyText: "{\"foo\":\"bar\"}",
      signingKey: "secret-key",
      timestamp: "1700000000",
      nonce: "nonce-123"
    });

    assert.deepEqual(headers, {
      "X-Client-Timestamp": "1700000000",
      "X-Client-Nonce": "nonce-123",
      "X-Client-Signature":
        "3f540ef92173d4ed6b2bda27a7721e536838ae20ce058bdaa98c40bce8480784"
    });
  });
});
