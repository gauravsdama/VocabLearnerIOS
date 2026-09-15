import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { POLICY_VERSION, currentPolicyAcceptance } from "../app/auth/policy";

describe("iOS registration policy acceptance", () => {
  it("uses the approved version for age, Terms, and Privacy acceptance", () => {
    assert.equal(POLICY_VERSION, "2026-09-15");
    assert.deepEqual(currentPolicyAcceptance(), {
      minimum_age_confirmed: true,
      terms_version: "2026-09-15",
      privacy_version: "2026-09-15",
    });
  });
});
