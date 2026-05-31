import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthIntroScreen from "../screens/AuthIntroScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import { AuthStackParamList } from "./types";

type AuthNavigatorProps = {
  initialRouteName?: keyof AuthStackParamList;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = ({ initialRouteName = "Intro" }: AuthNavigatorProps) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerTitleAlign: "center"
      }}
    >
      <Stack.Screen name="Intro" component={AuthIntroScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Welcome", presentation: "modal" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Create Account", presentation: "modal" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Reset Password" }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "Choose Password" }} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: "Verify Email" }} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
