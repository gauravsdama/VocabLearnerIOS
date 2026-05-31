import Constants from "expo-constants";

type ExtraConfig = {
  apiBaseUrl?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
  appIosScheme?: string;
  supportUrl?: string;
  privacyPolicyUrl?: string;
  appVariant?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

const pick = (...values: Array<string | undefined | null>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

export const iosAppConfig = {
  apiBaseUrl: pick(extra.apiBaseUrl, process.env.EXPO_PUBLIC_API_BASE_URL),
  googleWebClientId: pick(extra.googleWebClientId, process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
  googleIosClientId: pick(extra.googleIosClientId, process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
  appIosScheme: pick(extra.appIosScheme, process.env.EXPO_PUBLIC_APP_IOS_SCHEME, "vocabcat"),
  supportUrl: pick(extra.supportUrl, process.env.EXPO_PUBLIC_SUPPORT_URL),
  privacyPolicyUrl: pick(extra.privacyPolicyUrl, process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL),
  appVariant: pick(extra.appVariant, process.env.EXPO_PUBLIC_APP_VARIANT, "development"),
};
