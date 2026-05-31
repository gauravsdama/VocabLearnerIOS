import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmailVerificationPendingScreen from "../screens/EmailVerificationPendingScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const PendingNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="EmailVerificationPending"
      screenOptions={{
        headerTitleAlign: "center"
      }}
    >
      <Stack.Screen
        name="EmailVerificationPending"
        component={EmailVerificationPendingScreen}
        options={{ title: "Verify Email" }}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Reset Password" }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "Choose Password" }} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: "Verify Email" }} />
    </Stack.Navigator>
  );
};

export default PendingNavigator;
