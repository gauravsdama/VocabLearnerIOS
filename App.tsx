import "react-native-gesture-handler";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthNavigator from "./app/navigation/AuthNavigator";
import MainNavigator from "./app/navigation/MainNavigator";
import PendingNavigator from "./app/navigation/PendingNavigator";
import { AuthProvider, useAuth } from "./app/auth/AuthContext";
import { MessageProvider } from "./app/messages/MessageContext";
import { useFonts, Sora_400Regular, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";
import { colors } from "./app/theme/tokens";
import { iosAppConfig } from "./app/config";

const linking = {
  prefixes: [`${iosAppConfig.appIosScheme}://`],
  config: {
    screens: {
      Intro: "",
      Login: "login",
      Register: "register",
      ForgotPassword: "forgot-password",
      ResetPassword: "reset-password",
      EmailVerificationPending: "check-email",
      VerifyEmail: "verify-email",
    },
  },
};

const RootNavigator = () => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!token) {
    return <AuthNavigator />;
  }

  if (user?.email_verified === false) {
    return <PendingNavigator />;
  }

  return <MainNavigator />;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MessageProvider>
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </MessageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
