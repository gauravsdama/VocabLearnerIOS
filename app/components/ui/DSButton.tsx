import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing } from "../../theme/tokens";
import { typography } from "../../theme/typography";

type Variant = "primary" | "secondary" | "ghost";

type Size = "md" | "lg";

type DSButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
};

const DSButton = ({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "md",
  style
}: DSButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      {isPrimary && !disabled ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryPressed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles[size]]}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.surface : colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            typography.body,
            isPrimary && styles.labelPrimary,
            variant === "secondary" && styles.labelSecondary,
            variant === "ghost" && styles.labelGhost
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.rBtn,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: colors.primary,
    overflow: "hidden",
    position: "relative"
  },
  md: {
    paddingVertical: spacing.s2 - 2,
    paddingHorizontal: spacing.s3
  },
  lg: {
    paddingVertical: spacing.s3 - 2,
    paddingHorizontal: spacing.s4
  },
  secondary: {
    backgroundColor: colors.surface2,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.rBtn
  },
  label: {
    fontWeight: "600",
    color: colors.text
  },
  labelPrimary: {
    color: colors.surface
  },
  labelSecondary: {
    color: colors.text
  },
  labelGhost: {
    color: colors.primary
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.5
  }
});

export default DSButton;
