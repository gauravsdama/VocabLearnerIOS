import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../../theme/tokens";
import { typography } from "../../theme/typography";

type Tone = "default" | "primary" | "indigo" | "amber" | "success" | "danger";

const toneStyles: Record<Tone, { bg: string; text: string; border: string }> = {
  default: { bg: colors.surface2, text: colors.muted, border: colors.border },
  primary: { bg: colors.primaryTint, text: colors.primary, border: colors.primary },
  indigo: { bg: colors.indigoTint, text: colors.indigo, border: colors.indigo },
  amber: { bg: colors.amberTint, text: colors.amber, border: colors.amber },
  success: { bg: colors.successTint, text: colors.success, border: colors.success },
  danger: { bg: colors.dangerTint, text: colors.danger, border: colors.danger }
};

const DSPill = ({ label, tone = "default", style }: { label: string; tone?: Tone; style?: ViewStyle }) => {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[styles.base, { backgroundColor: toneStyle.bg, borderColor: toneStyle.border }, style]}>
      <Text style={[styles.text, typography.label, { color: toneStyle.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.rPill,
    paddingHorizontal: spacing.s2 - 4,
    paddingVertical: spacing.s1 - 2,
    borderWidth: 1
  },
  text: {
    letterSpacing: 1
  }
});

export default DSPill;
