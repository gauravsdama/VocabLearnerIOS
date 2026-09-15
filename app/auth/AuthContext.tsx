import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, setRefreshHandler, setUnauthorizedHandler } from "../api/client";
import type {
  AccountDeletionRequest,
  AppleAuthRequest,
  AuthResponse,
  ForgotPasswordRequest,
  GoogleAuthRequest,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  RefreshRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResendEmailVerificationResponse,
  User,
  VerifyEmailCodeRequest,
  VerifyEmailResponse
} from "../api/types";
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  hydrateAuthStorage,
  setAccessToken,
  setClientSigningKey,
  setRefreshToken
} from "../utils/storage";
import { iosAppConfig } from "../config";
import type { PolicyAcceptance } from "./policy";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  needsEmailVerification: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; displayName?: string } & PolicyAcceptance) => Promise<void>;
  signInWithGoogle: (acceptance?: PolicyAcceptance) => Promise<void>;
  signInWithApple: (acceptance?: PolicyAcceptance) => Promise<void>;
  resendVerification: () => Promise<ResendEmailVerificationResponse>;
  verifyEmailCode: (code: string) => Promise<VerifyEmailResponse>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  verifyEmailToken: (token: string) => Promise<VerifyEmailResponse>;
  refreshCurrentUser: () => Promise<User | null>;
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const clearSessionState = useCallback(async () => {
    await clearAuthStorage();
    setToken(null);
    setUser(null);
  }, []);

  const applySession = useCallback(async (response: AuthResponse) => {
    await setAccessToken(response.access_token);
    await setRefreshToken(response.refresh_token);
    await setClientSigningKey(response.client_signing_key ?? null);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return null;
    }
    const me = await apiFetch<User>("/auth/me", { method: "GET" }, undefined, {
      skipAuthRefresh: false
    });
    setUser(me);
    return me;
  }, []);

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      await clearSessionState();
      return false;
    }

    const promise = (async () => {
      try {
        const payload: RefreshRequest = { refresh_token: refreshToken };
        const response = await apiFetch<AuthResponse>(
          "/auth/refresh",
          {
            method: "POST",
            body: JSON.stringify(payload)
          },
          {
            startId: "IOS_AUTH_REFRESH_START",
            okId: "IOS_AUTH_REFRESH_OK",
            failId: "IOS_AUTH_REFRESH_FAIL"
          },
          {
            omitAuth: true,
            skipAuthRefresh: true
          }
        );
        await applySession(response);
        return true;
      } catch {
        await clearSessionState();
        return false;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, [applySession, clearSessionState]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: iosAppConfig.googleWebClientId || undefined,
      iosClientId: iosAppConfig.googleIosClientId || undefined,
      offlineAccess: false,
    });
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      const stored = await hydrateAuthStorage();
      if (!stored.accessToken && !stored.refreshToken) {
        setLoading(false);
        return;
      }

      if (!stored.accessToken && stored.refreshToken) {
        const refreshed = await refreshSession();
        if (!refreshed) {
          setLoading(false);
          return;
        }
      }

      try {
        await refreshCurrentUser();
      } catch {
        const refreshed = await refreshSession();
        if (refreshed) {
          try {
            await refreshCurrentUser();
          } catch {
            await clearSessionState();
          }
        } else {
          await clearSessionState();
        }
      }
      setLoading(false);
    };

    setUnauthorizedHandler(() => {
      void clearSessionState();
    });
    setRefreshHandler(() => refreshSession());
    void loadToken();

    return () => {
      setUnauthorizedHandler(null);
      setRefreshHandler(null);
    };
  }, [clearSessionState, refreshCurrentUser, refreshSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const payload: LoginRequest = { email, password };
    const response = await apiFetch<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      {
        startId: "IOS_AUTH_LOGIN_START",
        okId: "IOS_AUTH_LOGIN_OK",
        failId: "IOS_AUTH_LOGIN_FAIL"
      },
      {
        omitAuth: true,
        skipAuthRefresh: true
      }
    );
    await applySession(response);
  }, [applySession]);

  const signUp = useCallback(async ({ email, password, displayName, ...acceptance }: { email: string; password: string; displayName?: string } & PolicyAcceptance) => {
    const payload: RegisterRequest = {
      email,
      password,
      ...acceptance,
      ...(displayName ? { display_name: displayName } : {})
    };
    const response = await apiFetch<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      {
        startId: "IOS_AUTH_REG_START",
        okId: "IOS_AUTH_REG_OK",
        failId: "IOS_AUTH_REG_FAIL"
      },
      {
        omitAuth: true,
        skipAuthRefresh: true
      }
    );
    await applySession(response);
  }, [applySession]);

  const authenticateWithGoogleIdToken = useCallback(async (idToken: string, acceptance?: PolicyAcceptance) => {
    const payload: GoogleAuthRequest = { id_token: idToken, ...acceptance };
    const response = await apiFetch<AuthResponse>(
      "/auth/google",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      {
        startId: "IOS_AUTH_GOOGLE_START",
        okId: "IOS_AUTH_GOOGLE_OK",
        failId: "IOS_AUTH_GOOGLE_FAIL"
      },
      {
        omitAuth: true,
        skipAuthRefresh: true
      }
    );
    await applySession(response);
  }, [applySession]);

  const signInWithGoogle = useCallback(async (acceptance?: PolicyAcceptance) => {
    const googleResponse: any = await GoogleSignin.signIn();
    const googleData = googleResponse?.data ?? googleResponse;
    const idToken = googleData?.idToken ?? googleResponse?.idToken;
    if (!idToken) {
      throw new Error("Google did not return an ID token.");
    }
    await authenticateWithGoogleIdToken(idToken, acceptance);
  }, [authenticateWithGoogleIdToken]);

  const signInWithApple = useCallback(async (acceptance?: PolicyAcceptance) => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    });
    if (!credential.identityToken) {
      throw new Error("Apple did not return an identity token.");
    }
    const payload: AppleAuthRequest = {
      identity_token: credential.identityToken,
      authorization_code: credential.authorizationCode ?? null,
      given_name: credential.fullName?.givenName ?? null,
      family_name: credential.fullName?.familyName ?? null,
      ...acceptance,
    };
    const response = await apiFetch<AuthResponse>(
      "/auth/apple",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      {
        startId: "IOS_AUTH_APPLE_START",
        okId: "IOS_AUTH_APPLE_OK",
        failId: "IOS_AUTH_APPLE_FAIL"
      },
      {
        omitAuth: true,
        skipAuthRefresh: true
      }
    );
    await applySession(response);
  }, [applySession]);

  const resendVerification = useCallback(async () => {
    return apiFetch<ResendEmailVerificationResponse>(
      "/auth/resend-verification",
      { method: "POST" },
      {
        startId: "IOS_AUTH_RESEND_VERIFY_START",
        okId: "IOS_AUTH_RESEND_VERIFY_OK",
        failId: "IOS_AUTH_RESEND_VERIFY_FAIL"
      },
      {
        skipAuthRefresh: true
      }
    );
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const payload: ForgotPasswordRequest = { email };
    const response = await apiFetch<MessageResponse>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      {
        startId: "IOS_AUTH_FORGOT_START",
        okId: "IOS_AUTH_FORGOT_OK",
        failId: "IOS_AUTH_FORGOT_FAIL"
      },
      {
        omitAuth: true,
        skipAuthRefresh: true
      }
    );
    return response.message;
  }, []);

  const resetPassword = useCallback(async (tokenValue: string, newPassword: string) => {
    const payload: ResetPasswordRequest = {
      token: tokenValue,
      new_password: newPassword
    };
    const response = await apiFetch<MessageResponse>(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      {
        startId: "IOS_AUTH_RESET_START",
        okId: "IOS_AUTH_RESET_OK",
        failId: "IOS_AUTH_RESET_FAIL"
      },
      {
        omitAuth: true,
        skipAuthRefresh: true
      }
    );
    return response.message;
  }, []);

  const verifyEmailToken = useCallback(async (tokenValue: string) => {
    const response = await apiFetch<VerifyEmailResponse>(
      `/auth/verify-email?token=${encodeURIComponent(tokenValue)}`,
      { method: "GET" },
      {
        startId: "IOS_AUTH_VERIFY_EMAIL_START",
        okId: "IOS_AUTH_VERIFY_EMAIL_OK",
        failId: "IOS_AUTH_VERIFY_EMAIL_FAIL"
      },
      {
        omitAuth: true,
        skipAuthRefresh: true
      }
    );
    await refreshCurrentUser();
    return response;
  }, [refreshCurrentUser]);

  const verifyEmailCode = useCallback(async (code: string) => {
    const payload: VerifyEmailCodeRequest = { code };
    const response = await apiFetch<VerifyEmailResponse>(
      "/auth/verify-email-code",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      {
        startId: "IOS_AUTH_VERIFY_CODE_START",
        okId: "IOS_AUTH_VERIFY_CODE_OK",
        failId: "IOS_AUTH_VERIFY_CODE_FAIL"
      },
      {
        skipAuthRefresh: true
      }
    );
    await refreshCurrentUser();
    return response;
  }, [refreshCurrentUser]);

  const deleteAccount = useCallback(async () => {
    const payload: AccountDeletionRequest = { confirmation: "DELETE" };
    await apiFetch<MessageResponse>(
      "/users/me",
      {
        method: "DELETE",
        body: JSON.stringify(payload)
      },
      {
        startId: "IOS_ACCOUNT_DELETE_START",
        okId: "IOS_ACCOUNT_DELETE_OK",
        failId: "IOS_ACCOUNT_DELETE_FAIL"
      },
      {
        skipAuthRefresh: true
      }
    );
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore provider-local sign out issues after account deletion
    }
    await clearSessionState();
  }, [clearSessionState]);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        const payload: LogoutRequest = { refresh_token: refreshToken };
        await apiFetch<MessageResponse>(
          "/auth/logout",
          {
            method: "POST",
            body: JSON.stringify(payload)
          },
          {
            startId: "IOS_AUTH_LOGOUT_START",
            okId: "IOS_AUTH_LOGOUT_OK",
            failId: "IOS_AUTH_LOGOUT_FAIL"
          },
          {
            skipAuthRefresh: true
          }
        );
      }
    } catch {
      // server-side revocation is best-effort during logout
    }
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore provider-local sign out issues
    }
    await clearSessionState();
  }, [clearSessionState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      needsEmailVerification: Boolean(token && user && user.email_verified === false),
      signIn,
      signUp,
      signInWithGoogle,
      signInWithApple,
      resendVerification,
      verifyEmailCode,
      forgotPassword,
      resetPassword,
      verifyEmailToken,
      refreshCurrentUser,
      deleteAccount,
      signOut
    }),
    [
      token,
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithApple,
      resendVerification,
      verifyEmailCode,
      forgotPassword,
      resetPassword,
      verifyEmailToken,
      refreshCurrentUser,
      deleteAccount,
      signOut
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
