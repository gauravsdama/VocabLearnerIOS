import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { MessageDTO } from "../api/types";
import { colors, radius, shadow, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";
import { useMessages } from "./MessageContext";

const levelStyles: Record<string, { bg: string; border: string; text: string }> = {
  info: { bg: colors.indigoTint, border: colors.indigo, text: colors.indigo },
  success: { bg: colors.successTint, border: colors.success, text: colors.success },
  warning: { bg: colors.amberTint, border: colors.amber, text: colors.amber },
  error: { bg: colors.dangerTint, border: colors.danger, text: colors.danger }
};

const resolveMessageContent = (message: MessageDTO) => {
  const title =
    message.title ||
    (typeof message.heading === "string" ? message.heading : null) ||
    message.message ||
    "Update";
  const body =
    message.body && message.body !== title
      ? message.body
      : message.message && message.message !== title
        ? message.message
        : null;
  return { title, body };
};

const getToneLabel = (message: MessageDTO) => {
  const level =
    typeof message.level === "string"
      ? message.level
      : typeof message.type === "string"
        ? message.type
        : typeof message.severity === "string"
          ? message.severity
          : "info";
  if (level === "success") {
    return "success";
  }
  if (level === "warning") {
    return "warning";
  }
  if (level === "error") {
    return "error";
  }
  return "info";
};

const MessageBannerStack = () => {
  const { messages, dismissMessage } = useMessages();

  if (messages.length === 0) {
    return null;
  }

  return (
    <View style={styles.stack}>
      {messages.map((message) => {
        const level = getToneLabel(message);
        const palette = levelStyles[level] || levelStyles.info;
        const { title, body } = resolveMessageContent(message);
        const label = level.toUpperCase();
        const nextReset = message.details?.next_reset_at;
        const dismissible = message.dismissible !== false;
        return (
          <View key={message.id} style={[styles.banner, { backgroundColor: palette.bg, borderColor: palette.border }]}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, typography.label, { color: palette.text }]}>{label}</Text>
              <Text style={[styles.title, typography.body]}>{title}</Text>
              {body ? <Text style={[styles.body, typography.caption]}>{body}</Text> : null}
              {typeof nextReset === "string" ? (
                <Text style={[styles.body, typography.caption]}>{`Next reset: ${nextReset}`}</Text>
              ) : null}
            </View>
            <View style={styles.actions}>
              {message.action_label && message.action_url ? (
                <Pressable
                  onPress={() => void Linking.openURL(message.action_url || "")}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
                >
                  <Text style={[styles.actionText, typography.caption]}>{message.action_label}</Text>
                </Pressable>
              ) : null}
              {dismissible ? (
                <Pressable
                  onPress={() => void dismissMessage(message.id)}
                  style={({ pressed }) => [styles.dismissButton, pressed && styles.actionPressed]}
                >
                  <Text style={[styles.dismissText, typography.caption]}>Dismiss</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  stack: {
    gap: spacing.s1,
    marginBottom: spacing.s2
  },
  banner: {
    borderRadius: radius.rBtn,
    borderWidth: 1,
    padding: spacing.s2,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.s2,
    ...shadow
  },
  textBlock: {
    flex: 1,
    gap: spacing.s1 - 2
  },
  label: {
    letterSpacing: 1
  },
  title: {
    color: colors.text
  },
  body: {
    color: colors.muted
  },
  actions: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    gap: spacing.s1
  },
  actionButton: {
    paddingHorizontal: spacing.s1,
    paddingVertical: spacing.s1 - 2,
    borderRadius: radius.rPill,
    backgroundColor: colors.surface
  },
  actionPressed: {
    opacity: 0.8
  },
  actionText: {
    color: colors.text,
    fontWeight: "600"
  },
  dismissButton: {
    paddingHorizontal: spacing.s1,
    paddingVertical: spacing.s1 - 2
  },
  dismissText: {
    color: colors.text,
    fontWeight: "600"
  }
});

export default MessageBannerStack;
