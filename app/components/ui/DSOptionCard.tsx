import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme/tokens";
import { typography } from "../../theme/typography";

type OptionState = "idle" | "selected" | "correct" | "incorrect" | "disabled";

type DSOptionCardProps = {
  label: string;
  state?: OptionState;
  onPress?: () => void;
};

const stateStyles: Record<OptionState, { border: string; bg: string; text: string; icon?: string }> = {
  idle: { border: colors.border, bg: colors.surface, text: colors.text },
  selected: { border: colors.primary, bg: colors.primaryTint, text: colors.text },
  correct: { border: colors.success, bg: colors.successTint, text: colors.text, icon: "✓" },
  incorrect: { border: colors.danger, bg: colors.dangerTint, text: colors.text, icon: "✕" },
  disabled: { border: colors.border, bg: colors.surface2, text: colors.muted }
};

const DSOptionCard = ({ label, state = "idle", onPress }: DSOptionCardProps) => {
  const palette = stateStyles[state];
  return (
    <Pressable
      onPress={onPress}
      disabled={state === "disabled"}
      style={({ pressed }) => [
        styles.base,
        { borderColor: palette.border, backgroundColor: palette.bg },
        pressed && state !== "disabled" && styles.pressed
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.text, typography.body, { color: palette.text }]}>{label}</Text>
        {palette.icon && <Text style={[styles.icon, { color: palette.border }]}>{palette.icon}</Text>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.rOption,
    borderWidth: 1,
    padding: spacing.s2,
    backgroundColor: colors.surface
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.s1
  },
  text: {
    flex: 1
  },
  icon: {
    fontSize: 16
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }]
  }
});

export default DSOptionCard;
