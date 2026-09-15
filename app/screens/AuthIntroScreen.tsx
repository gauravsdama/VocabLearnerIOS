import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScreenContainer from "../components/ScreenContainer";
import DSButton from "../components/ui/DSButton";
import { AuthStackParamList } from "../navigation/types";
import { colors, radius, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AuthStackParamList, "Intro">;
type FeatureId = "words" | "quizzes" | "progress";

const features: Array<{
  id: FeatureId;
  label: string;
  title: string;
  body: string;
  preview: string;
}> = [
  {
    id: "words",
    label: "Daily feed",
    title: "Swipe through words in context.",
    body: "Definitions, examples, and short prompts stay in one focused flow.",
    preview: "abate"
  },
  {
    id: "quizzes",
    label: "Recall checks",
    title: "Answer while the word is fresh.",
    body: "Quick feedback helps each session stay useful without slowing you down.",
    preview: "Which choice means to lessen?"
  },
  {
    id: "progress",
    label: "Progress",
    title: "Keep your pace visible.",
    body: "Streaks, accuracy, and daily targets make the habit easier to manage.",
    preview: "82% accuracy"
  }
];

const AuthIntroScreen = ({ navigation }: Props) => {
  const [activeFeature, setActiveFeature] = useState<FeatureId>("words");
  const active = features.find((feature) => feature.id === activeFeature) ?? features[0];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.navRow}>
          <Text style={styles.brand}>VocabCat</Text>
          <Pressable onPress={() => navigation.navigate("Login")} style={styles.navButton}>
            <Text style={[styles.navButtonText, typography.caption]}>Log in</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.copy}>
            <Text style={[styles.eyebrow, typography.label]}>Vocabulary that keeps moving</Text>
            <Text style={styles.title}>Build a word habit one focused swipe at a time.</Text>
            <Text style={[styles.lede, typography.body]}>
              VocabCat turns vocabulary practice into a short daily feed with context, recall checks, and progress you can understand at a glance.
            </Text>
            <DSButton
              label="Log in / Sign up"
              size="lg"
              onPress={() => navigation.navigate("Login")}
              style={styles.primaryAction}
            />
          </View>

          <View style={styles.previewShell}>
            <View style={styles.previewCard}>
              <Text style={[styles.previewLabel, typography.label]}>{active.label}</Text>
              <Text style={styles.previewWord}>{active.preview}</Text>
              <Text style={[styles.previewText, typography.body]}>{active.title}</Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
            <View style={styles.previewMeta}>
              <Text style={[styles.metaText, typography.caption]}>3 min</Text>
              <Text style={[styles.metaText, typography.caption]}>Next check ready</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.eyebrow, typography.label]}>How it works</Text>
          <Text style={[styles.sectionTitle, typography.h2]}>Learn, recall, and adjust your pace.</Text>
          <View style={styles.featureList}>
            {features.map((feature) => {
              const selected = feature.id === activeFeature;
              return (
                <Pressable
                  key={feature.id}
                  onPress={() => setActiveFeature(feature.id)}
                  style={({ pressed }) => [
                    styles.featureCard,
                    selected && styles.featureCardActive,
                    pressed && styles.featureCardPressed
                  ]}
                >
                  <Text style={[styles.featureLabel, typography.label]}>{feature.label}</Text>
                  <Text style={[styles.featureTitle, typography.body]}>{feature.title}</Text>
                  <Text style={[styles.featureBody, typography.caption]}>{feature.body}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.s5,
    gap: spacing.s4
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.s2
  },
  brand: {
    ...typography.h2,
    color: colors.text
  },
  navButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.s1
  },
  navButtonText: {
    color: colors.primary,
    fontWeight: "600"
  },
  hero: {
    gap: spacing.s4
  },
  copy: {
    gap: spacing.s2
  },
  eyebrow: {
    color: colors.muted
  },
  title: {
    ...typography.h1,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0,
    color: colors.text
  },
  lede: {
    color: colors.muted
  },
  primaryAction: {
    marginTop: spacing.s1
  },
  previewShell: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: spacing.s2,
    shadowColor: "#020617",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7
  },
  previewCard: {
    minHeight: 300,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    padding: spacing.s3,
    justifyContent: "center",
    gap: spacing.s2
  },
  previewLabel: {
    color: colors.primary
  },
  previewWord: {
    ...typography.h1,
    fontSize: 34,
    letterSpacing: 0,
    color: colors.primary
  },
  previewText: {
    color: colors.muted
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.rPill,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  progressFill: {
    width: "68%",
    height: "100%",
    backgroundColor: colors.indigo
  },
  previewMeta: {
    marginTop: spacing.s2,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.s2
  },
  metaText: {
    color: colors.muted
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s4,
    gap: spacing.s2
  },
  sectionTitle: {
    color: colors.text
  },
  featureList: {
    gap: spacing.s2,
    marginTop: spacing.s1
  },
  featureCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.82)",
    padding: spacing.s2,
    gap: spacing.s1
  },
  featureCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface
  },
  featureCardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }]
  },
  featureLabel: {
    color: colors.primary
  },
  featureTitle: {
    color: colors.text,
    fontWeight: "600"
  },
  featureBody: {
    color: colors.muted,
    lineHeight: 20
  }
});

export default AuthIntroScreen;
