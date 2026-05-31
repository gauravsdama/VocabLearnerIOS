import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const CLIENT_SIGNING_KEY = "client_signing_key";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let clientSigningKey: string | null = null;

const persistValue = async (key: string, value: string | null) => {
  try {
    if (value) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch {
    // persistence is best-effort on mobile
  }
};

export const hydrateAuthStorage = async () => {
  try {
    const [storedToken, storedRefreshToken, storedSigningKey] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(CLIENT_SIGNING_KEY)
    ]);
    accessToken = storedToken;
    refreshToken = storedRefreshToken;
    clientSigningKey = storedSigningKey;
    return {
      accessToken,
      refreshToken,
      clientSigningKey
    };
  } catch {
    accessToken = null;
    refreshToken = null;
    clientSigningKey = null;
    return {
      accessToken: null,
      refreshToken: null,
      clientSigningKey: null
    };
  }
};

export const getAccessToken = () => accessToken;

export const getRefreshToken = () => refreshToken;

export const getClientSigningKey = () => clientSigningKey;

export const setAccessToken = async (token: string | null) => {
  accessToken = token;
  await persistValue(ACCESS_TOKEN_KEY, token);
};

export const setRefreshToken = async (token: string | null) => {
  refreshToken = token;
  await persistValue(REFRESH_TOKEN_KEY, token);
};

export const setClientSigningKey = async (key: string | null) => {
  clientSigningKey = key;
  await persistValue(CLIENT_SIGNING_KEY, key);
};

export const clearAuthStorage = async () => {
  accessToken = null;
  refreshToken = null;
  clientSigningKey = null;
  await Promise.all([
    persistValue(ACCESS_TOKEN_KEY, null),
    persistValue(REFRESH_TOKEN_KEY, null),
    persistValue(CLIENT_SIGNING_KEY, null)
  ]);
};
