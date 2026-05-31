jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from "expo-secure-store";
import {
  clearAuthStorage,
  getAccessToken,
  getClientSigningKey,
  getRefreshToken,
  hydrateAuthStorage,
  setAccessToken,
  setClientSigningKey,
  setRefreshToken,
} from "./storage";

const secureStore = jest.mocked(SecureStore);

describe("auth storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hydrates in-memory auth state from SecureStore", async () => {
    secureStore.getItemAsync
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token")
      .mockResolvedValueOnce("signing-key");

    const hydrated = await hydrateAuthStorage();

    expect(hydrated).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      clientSigningKey: "signing-key",
    });
    expect(getAccessToken()).toBe("access-token");
    expect(getRefreshToken()).toBe("refresh-token");
    expect(getClientSigningKey()).toBe("signing-key");
  });

  it("clears persisted and in-memory auth state", async () => {
    await setAccessToken("access-token");
    await setRefreshToken("refresh-token");
    await setClientSigningKey("signing-key");

    await clearAuthStorage();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getClientSigningKey()).toBeNull();
    expect(secureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
  });
});
