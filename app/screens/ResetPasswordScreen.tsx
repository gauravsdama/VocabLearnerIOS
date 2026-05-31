import React, { useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScreenContainer from "../components/ScreenContainer";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import InlineError from "../components/InlineError";
import DSCard from "../components/ui/DSCard";
import { useAuth } from "../auth/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(route.params?.token ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError(null);
    setMessage(null);
    if (!token.trim()) {
      setError("A reset token is required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await resetPassword(token.trim(), password);
      setMessage(response);
    } catch (err: any) {
      setError(err?.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={[styles.title, typography.h2]}>Choose a new password</Text>
              <Text style={[styles.subtitle, typography.body]}>Paste the token from your email if the screen did not open it automatically.</Text>
            </View>
            <DSCard style={styles.card}>
              <InlineError message={error} />
              {message ? <Text style={[styles.info, typography.body]}>{message}</Text> : null}
              <TextField
                label="Reset token"
                value={token}
                onChangeText={setToken}
                placeholder="Paste your token"
                returnKeyType="next"
                textContentType="none"
                autoComplete="off"
              />
              <TextField
                label="New password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a strong password"
                secureTextEntry
                returnKeyType="next"
                textContentType="password"
                autoComplete="password"
              />
              <TextField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                secureTextEntry
                returnKeyType="done"
                textContentType="password"
                autoComplete="password"
                onSubmitEditing={() => void handleSubmit()}
              />
              <PrimaryButton label={loading ? "Updating..." : "Update password"} onPress={handleSubmit} disabled={loading} />
              {loading ? <ActivityIndicator style={styles.spinner} color={colors.primary} /> : null}
              <Pressable onPress={() => navigation.navigate("Login")} style={styles.link}>
                <Text style={[styles.linkText, typography.body]}>Back to login</Text>
              </Pressable>
            </DSCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.s4 },
  header: { marginBottom: spacing.s2 },
  title: { color: colors.text, marginBottom: spacing.s1 },
  subtitle: { color: colors.muted },
  card: { gap: spacing.s1 },
  info: {
    color: colors.text,
    backgroundColor: colors.surface2,
    padding: spacing.s2,
    borderRadius: 16,
    marginBottom: spacing.s2,
  },
  spinner: { marginTop: spacing.s1 },
  link: { marginTop: spacing.s2, alignItems: "center" },
  linkText: { color: colors.primary, fontWeight: "600" },
});

export default ResetPasswordScreen;
