import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import DSCard from "../components/ui/DSCard";
import { useAuth } from "../auth/AuthContext";
import { MainStackParamList } from "../navigation/types";
import { apiFetch } from "../api/client";
import { MessageDTO, MessagesResponse } from "../api/types";
import { useMessages } from "../messages/MessageContext";
import { extractMessages } from "../messages/messageUtils";
import { colors, radius, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<MainStackParamList, "Home">;
const showTraceUi = process.env.EXPO_PUBLIC_TRACE_UI === "true";

const HomeScreen = ({ navigation }: Props) => {
  const { signOut } = useAuth();
  const { ingestMessages } = useMessages();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadMessages = async () => {
        try {
          const data = await apiFetch<MessagesResponse | MessageDTO[]>("/messages", { method: "GET" });
          if (active) {
            ingestMessages(extractMessages(data));
          }
        } catch {
          // ignore message load failures
        }
      };
      void loadMessages();
      return () => {
        active = false;
      };
    }, [ingestMessages])
  );

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.brand}>VocabCat</Text>
          <Text style={[styles.title, typography.h2]}>Choose your next move.</Text>
        </View>
        <Pressable onPress={() => void signOut()} style={styles.logoutButton}>
          <Text style={[styles.logoutText, typography.caption]}>Log out</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate("Feed")} style={({ pressed }) => [styles.tilePressable, pressed && styles.tilePressed]}>
        <DSCard accent="word" style={styles.primaryTile}>
          <View style={styles.tileBadgeRow}>
            <View style={[styles.badge, styles.badgePrimary]} />
            <Text style={[styles.tileEyebrow, typography.label]}>Start</Text>
          </View>
          <Text style={[styles.primaryTileTitle, typography.h1]}>Start Scrolling</Text>
          <Text style={[styles.tileSubtitle, typography.body]}>
            Dive into words, quizzes, and prompts in a full-screen feed.
          </Text>
        </DSCard>
      </Pressable>

      <View style={styles.secondaryRow}>
        <Pressable style={({ pressed }) => [styles.tilePressable, pressed && styles.tilePressed]} onPress={() => navigation.navigate("Settings")}>
          <DSCard accent="sentence" style={styles.secondaryTile}>
            <View style={styles.tileBadgeRow}>
              <View style={[styles.badge, styles.badgeAmber]} />
              <Text style={[styles.tileEyebrow, typography.label]}>Configure</Text>
            </View>
            <Text style={[styles.secondaryTileTitle, typography.h2]}>Preferences</Text>
            <Text style={[styles.tileSubtitle, typography.body]}>Set your goals, timezone, and SMS updates.</Text>
          </DSCard>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.tilePressable, pressed && styles.tilePressed]} onPress={() => navigation.navigate("Stats")}>
          <DSCard accent="quiz" style={styles.secondaryTile}>
            <View style={styles.tileBadgeRow}>
              <View style={[styles.badge, styles.badgeIndigo]} />
              <Text style={[styles.tileEyebrow, typography.label]}>Stats</Text>
            </View>
            <Text style={[styles.secondaryTileTitle, typography.h2]}>Stats & Summary</Text>
            <Text style={[styles.tileSubtitle, typography.body]}>Track streaks, accuracy, and progress.</Text>
          </DSCard>
        </Pressable>
      </View>

      {showTraceUi && (
        <Pressable style={styles.diagnosticsLink} onPress={() => navigation.navigate("Diagnostics")}>
          <Text style={[styles.diagnosticsText, typography.body]}>Diagnostics</Text>
        </Pressable>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.s2
  },
  brand: {
    color: colors.muted,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    letterSpacing: 0
  },
  title: {
    color: colors.text,
    marginTop: spacing.s1
  },
  logoutButton: {
    paddingHorizontal: spacing.s2 - 4,
    paddingVertical: spacing.s1,
    borderRadius: radius.rPill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  logoutText: {
    color: colors.primary
  },
  tilePressable: {
    width: "100%"
  },
  tilePressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }]
  },
  primaryTile: {
    minHeight: 240,
    justifyContent: "center",
    marginBottom: spacing.s2,
    marginHorizontal: 4
  },
  secondaryRow: {
    flexDirection: "column",
    gap: spacing.s2,
    paddingHorizontal: 4
  },
  secondaryTile: {
    minHeight: 140
  },
  tileBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s1,
    marginBottom: spacing.s1
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  badgePrimary: {
    backgroundColor: colors.primaryTint
  },
  badgeIndigo: {
    backgroundColor: colors.indigoTint
  },
  badgeAmber: {
    backgroundColor: colors.amberTint
  },
  tileEyebrow: {
    color: colors.muted
  },
  primaryTileTitle: {
    color: colors.primary,
    marginBottom: spacing.s1
  },
  secondaryTileTitle: {
    color: colors.text,
    marginBottom: spacing.s1
  },
  tileSubtitle: {
    color: colors.muted
  },
  diagnosticsLink: {
    marginTop: spacing.s2,
    alignSelf: "flex-start"
  },
  diagnosticsText: {
    color: colors.primary,
    fontWeight: "600"
  }
});

export default HomeScreen;
