import { hmacSha256Hex, sha256Hex } from "../utils/sha256";

type SignatureHeaderInput = {
  method: string;
  url: string;
  bodyText: string;
  signingKey: string;
  timestamp?: string;
  nonce?: string;
};

export function createClientNonce() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `nonce-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function buildSignatureHeaders({
  method,
  url,
  bodyText,
  signingKey,
  timestamp = String(Math.floor(Date.now() / 1000)),
  nonce = createClientNonce()
}: SignatureHeaderInput) {
  const bodyHash = sha256Hex(bodyText);
  const path = new URL(url).pathname;
  const payload = [method.toUpperCase(), path, timestamp, nonce, bodyHash].join("\n");
  const signature = hmacSha256Hex(signingKey, payload);

  return {
    "X-Client-Timestamp": timestamp,
    "X-Client-Nonce": nonce,
    "X-Client-Signature": signature
  };
}
