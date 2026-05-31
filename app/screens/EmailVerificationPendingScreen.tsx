import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import InlineError from "../components/InlineError";
import TextField from "../components/TextField";
import DSCard from "../components/ui/DSCard";
import { useAuth } from "../auth/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AuthStackParamList, "EmailVerificationPending">;

const EmailVerificationPendingScreen = ({ navigation }: Props) => {
  const { user, resendVerification, verifyEmailCode, refreshCurrentUser, signOut } = useAuth();
  const [code, setCode] = useState("");
  const [codeEntryVisible, setCodeEntryVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const response = await resendVerification();
      setMessage(
        response.sent
          ? `Email verification code sent to ${user?.email ?? "your inbox"}.`
          : "Your email is already verified.",
      );
      if (response.sent) {
        setCodeEntryVisible(true);
      }
      const nextUser = await refreshCurrentUser();
      if (nextUser?.email_verified !== false) {
        return;
      }
    } catch (err: any) {
      setError(err?.message || "Unable to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = async () => {
    setError(null);
    const nextUser = await refreshCurrentUser();
    if (nextUser?.email_verified !== false) {
      return;
    }
    setMessage("Your account is still waiting for email verification.");
  };

  const handleVerifyCode = async () => {
    setError(null);
    setMessage(null);
    setVerifying(true);
    try {
      await verifyEmailCode(code);
      setMessage("Your email is now verified.");
    } catch (err: any) {
      setError(err?.message || "Unable to verify that code.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, typography.h2]}>Check your inbox</Text>
          <Text style={[styles.subtitle, typography.body]}>
            Your account stays in the verification flow until this email is verified.
          </Text>
          <Text style={[styles.subtitle, typography.body]}>
            Send an email verification code to {user?.email ?? "your email"}, then enter it here.
          </Text>
        </View>
        <DSCard style={styles.card}>
          <InlineError message={error} />
          {message ? <Text style={[styles.info, typography.body]}>{message}</Text> : null}
          <PrimaryButton
            label={loading ? "Sending..." : codeEntryVisible ? "Resend email verification code" : "Send email verification code"}
            onPress={() => void handleResend()}
            disabled={loading}
          />
          {codeEntryVisible ? (
            <>
              <TextField
                label="Email verification code"
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                keyboardType="numeric"
                textContentType="none"
                autoComplete="off"
                returnKeyType="done"
                maxLength={6}
              />
              <PrimaryButton
                label={verifying ? "Verifying..." : "Verify code"}
                onPress={() => void handleVerifyCode()}
                disabled={verifying || !code.trim()}
              />
            </>
          ) : null}
          {loading ? <ActivityIndicator style={styles.spinner} color={colors.primary} /> : null}
          <PrimaryButton label="I already verified" onPress={() => void handleVerified()} />
          <PrimaryButton label="Sign out" onPress={() => void signOut()} />
          <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={styles.link}>
            <Text style={[styles.linkText, typography.body]}>Need to reset your password?</Text>
          </Pressable>
        </DSCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
    gap: spacing.s2
  },
  info: {
    color: colors.text,
    backgroundColor: colors.surface2,
    padding: spacing.s2,
    borderRadius: 16,
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
  }
});

export default EmailVerificationPendingScreen;
