import React from "react";
import { StyleSheet, Text, View } from "react-native";
import DSCard from "../components/ui/DSCard";
import { colors, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

const EndCard = ({ subtitle }: { subtitle?: string }) => {
  return (
    <DSCard style={styles.card}>
      <View style={styles.container}>
        <Text style={[styles.title, typography.h2]}>You are all caught up</Text>
        <Text style={[styles.subtitle, typography.body]}>
          {subtitle || "Pull to refresh when you're ready for more."}
        </Text>
      </View>
    </DSCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.s3,
    gap: spacing.s2
  },
  title: {
    color: colors.text
  },
  subtitle: {
    color: colors.muted,
    textAlign: "center"
  },
  card: {
    flex: 1
  }
});

export default EndCard;
