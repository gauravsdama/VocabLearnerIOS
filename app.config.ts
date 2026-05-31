import type { ConfigContext, ExpoConfig } from "expo/config";
import { existsSync } from "fs";

type ExpoPlugin = string | [string, Record<string, unknown>];

function env(name: string, fallback?: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

function required(name: string, value: string | undefined, when: boolean): string {
  if (!when) {
    return value ?? "";
  }
  if (!value) {
    throw new Error(
      `[app.config] Missing required env var: ${name}. Set it in your shell, EAS environment, or local uncommitted env file.`,
    );
  }
  return value;
}

const deriveGoogleIosUrlScheme = (clientId: string) => {
  const trimmed = clientId.trim();
  if (!trimmed.endsWith(".apps.googleusercontent.com")) {
    return "";
  }
  return `com.googleusercontent.apps.${trimmed.replace(/\.apps\.googleusercontent\.com$/, "")}`;
};

function boolEnv(name: string, fallback: boolean): boolean {
  const value = env(name);
  if (!value) {
    return fallback;
  }
  return value.toLowerCase() === "true";
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVariant = env("APP_VARIANT", "development");
  const isProduction = appVariant === "production";
  const appIosScheme = env("APP_IOS_SCHEME", "vocabcat") ?? "vocabcat";
  const googleWebClientId = env("GOOGLE_WEB_CLIENT_ID", "") ?? "";
  const googleIosClientId = env("GOOGLE_IOS_CLIENT_ID", "") ?? "";
  const googleIosUrlScheme = deriveGoogleIosUrlScheme(googleIosClientId);
  const iosBundleIdentifier = required(
    "IOS_BUNDLE_IDENTIFIER",
    env("IOS_BUNDLE_IDENTIFIER", env("APPLE_IOS_BUNDLE_ID")),
    isProduction,
  );
  const appVersion = required("APP_VERSION", env("APP_VERSION", config.version ?? "0.1.0"), isProduction);
  const iosBuildNumber = env("IOS_BUILD_NUMBER", config.ios?.buildNumber ?? "1") ?? "1";
  const supportUrl = required("SUPPORT_URL", env("SUPPORT_URL"), isProduction);
  const privacyPolicyUrl = required("PRIVACY_POLICY_URL", env("PRIVACY_POLICY_URL"), isProduction);
  const splashBackgroundColor = env("SPLASH_BACKGROUND_COLOR", "#FFFFFF") ?? "#FFFFFF";
  const hasDarkSplashIcon = existsSync("./assets/images/splash-icon-dark.png");

  const plugins: ExpoPlugin[] = [
    "expo-apple-authentication",
    [
      "expo-splash-screen",
      {
        backgroundColor: splashBackgroundColor,
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        ...(hasDarkSplashIcon
          ? {
              dark: {
                backgroundColor: splashBackgroundColor,
                image: "./assets/images/splash-icon-dark.png",
              },
            }
          : {}),
      },
    ],
  ];
  if (googleIosUrlScheme) {
    plugins.push([
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: googleIosUrlScheme,
      },
    ]);
  }

  return {
    ...config,
    name: config.name ?? "Vocabcat",
    slug: config.slug ?? "vocabcat",
    scheme: appIosScheme,
    version: appVersion,
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    icon: "./assets/images/icon.png",
    plugins,
    ios: {
      ...config.ios,
      supportsTablet: boolEnv("IOS_SUPPORTS_TABLET", true),
      bundleIdentifier: iosBundleIdentifier || undefined,
      buildNumber: iosBuildNumber,
      infoPlist: {
        ...config.ios?.infoPlist,
        NSPhotoLibraryUsageDescription: "Allow access to photos to attach screenshots to support requests.",
        // IMPORTANT: This declares that the app does not use non-exempt encryption.
        // Keep this only if encryption is limited to exempt OS-provided capabilities
        // such as HTTPS/TLS through Apple system frameworks. Remove or change this
        // if the app implements non-exempt cryptography or uses non-exempt crypto SDKs.
        ITSAppUsesNonExemptEncryption: false,
      },
      // Expo generates PrivacyInfo.xcprivacy from this object. Start minimal, then
      // add NSPrivacyAccessedAPITypes entries only when Apple/TestFlight warnings
      // identify required-reason API categories used by the app or dependencies.
      privacyManifests: {},
    },
    extra: {
      ...config.extra,
      apiBaseUrl: env("EXPO_PUBLIC_API_BASE_URL", "") ?? "",
      googleWebClientId,
      googleIosClientId,
      appIosScheme,
      supportUrl,
      privacyPolicyUrl,
      appVariant,
    },
  };
};
