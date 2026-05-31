import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

const InlineError = ({ message }: { message?: string | null }) => {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.text, typography.body]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerTint,
    borderRadius: radius.rOption,
    padding: spacing.s2,
    marginBottom: spacing.s2,
    borderWidth: 1,
    borderColor: colors.danger
  },
  text: {
    color: colors.danger,
    fontSize: 14
  }
});

export default InlineError;
