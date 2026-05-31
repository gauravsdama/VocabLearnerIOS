import * as AppleAuthentication from "expo-apple-authentication";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScreenContainer from "../components/ScreenContainer";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import InlineError from "../components/InlineError";
import DSCard from "../components/ui/DSCard";
import { useAuth } from "../auth/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { colors, spacing, radius } from "../theme/tokens";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen = ({ navigation }: Props) => {
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    Keyboard.dismiss();
    setError(null);
    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined,
      });
    } catch (err: any) {
      setError(err?.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || "Unable to continue with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleApple = async () => {
    setError(null);
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (err: any) {
      if (err?.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      setError(err?.message || "Unable to continue with Apple.");
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={[styles.title, typography.h2]}>Create your account</Text>
              <Text style={[styles.subtitle, typography.body]}>Build a daily vocabulary habit in minutes.</Text>
            </View>
            <DSCard style={styles.card}>
              <InlineError message={error} />
              <TextField
                label="Display name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="What should we call you?"
                returnKeyType="next"
                textContentType="username"
                autoComplete="username"
              />
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                keyboardType="email-address"
                returnKeyType="next"
                textContentType="emailAddress"
                autoComplete="email"
              />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                returnKeyType="done"
                textContentType="password"
                autoComplete="password"
                onSubmitEditing={() => void handleRegister()}
              />
              <PrimaryButton label={loading ? "Creating..." : "Create Account"} onPress={handleRegister} disabled={loading} />
              {loading && <ActivityIndicator style={styles.spinner} color={colors.primary} />}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, typography.body]}>or</Text>
                <View style={styles.dividerLine} />
              </View>
              <PrimaryButton
                label={googleLoading ? "Connecting Google..." : "Continue with Google"}
                onPress={handleGoogle}
                disabled={googleLoading || loading || appleLoading}
              />
              {Platform.OS === "ios" ? (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={radius.rBtn}
                  style={styles.appleButton}
                  onPress={() => void handleApple()}
                />
              ) : null}
              {appleLoading ? <ActivityIndicator style={styles.spinner} color={colors.text} /> : null}
              <Pressable onPress={() => navigation.navigate("Login")} style={styles.link}>
                <Text style={[styles.linkText, typography.body]}>Already have an account? Sign in</Text>
              </Pressable>
            </DSCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.s4
  },
  header: {
    marginBottom: spacing.s2
  },
  title: {
    color: colors.text,
    marginBottom: spacing.s1
  },
  subtitle: {
    color: colors.muted
  },
  card: {
    gap: spacing.s1
  },
  spinner: {
    marginTop: spacing.s1
  },
  link: {
    marginTop: spacing.s2,
    alignItems: "center"
  },
  linkText: {
    color: colors.primary,
    fontWeight: "600"
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s1,
    marginVertical: spacing.s2
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    color: colors.muted
  },
  appleButton: {
    width: "100%",
    height: 52,
    marginTop: spacing.s1
  }
});

export default RegisterScreen;
