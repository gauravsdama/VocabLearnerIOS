import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import InlineError from "../components/InlineError";
import DSCard from "../components/ui/DSCard";
import { useAuth } from "../auth/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyEmail">;

type VerifyState =
  | { status: "loading" }
  | { status: "success"; alreadyVerified: boolean }
  | { status: "error"; message: string };

const VerifyEmailScreen = ({ navigation, route }: Props) => {
  const { verifyEmailToken, token } = useAuth();
  const [state, setState] = useState<VerifyState>({ status: "loading" });

  useEffect(() => {
    const tokenValue = route.params?.token?.trim();
    if (!tokenValue) {
      setState({ status: "error", message: "This verification link is missing a token." });
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const response = await verifyEmailToken(tokenValue);
        if (!cancelled) {
          setState({
            status: "success",
            alreadyVerified: Boolean(response.already_verified),
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState({ status: "error", message: err?.message || "Unable to verify your email." });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [route.params?.token, verifyEmailToken]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, typography.h2]}>Email verification</Text>
        </View>
        <DSCard style={styles.card}>
          {state.status === "loading" ? (
            <>
              <Text style={[styles.subtitle, typography.body]}>Verifying your email now.</Text>
              <ActivityIndicator color={colors.primary} />
            </>
          ) : null}
          {state.status === "success" ? (
            <>
              <Text style={[styles.subtitle, typography.body]}>
                {state.alreadyVerified ? "Your email was already verified." : "Your email is now verified."}
              </Text>
              <PrimaryButton
                label={token ? "Continue" : "Back to login"}
                onPress={() => navigation.navigate(token ? "EmailVerificationPending" : "Login")}
              />
            </>
          ) : null}
          {state.status === "error" ? (
            <>
              <InlineError message={state.message} />
              <Pressable onPress={() => navigation.navigate("Login")} style={styles.link}>
                <Text style={[styles.linkText, typography.body]}>Back to login</Text>
              </Pressable>
            </>
          ) : null}
        </DSCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingBottom: spacing.s4 },
  header: { marginBottom: spacing.s2 },
  title: { color: colors.text, marginBottom: spacing.s1 },
  card: { gap: spacing.s2 },
  subtitle: { color: colors.muted },
  link: { marginTop: spacing.s2, alignItems: "center" },
  linkText: { color: colors.primary, fontWeight: "600" },
});

export default VerifyEmailScreen;
