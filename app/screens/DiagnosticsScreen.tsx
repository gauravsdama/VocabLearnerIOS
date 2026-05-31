import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import ScreenContainer from "../components/ScreenContainer";
import DSButton from "../components/ui/DSButton";
import DSCard from "../components/ui/DSCard";
import { colors, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";
import { getLogs, LogEntry, subscribeLogs } from "../utils/logger";
import { apiPing } from "../api/client";

const DiagnosticsScreen = () => {
  const [entries, setEntries] = useState<LogEntry[]>(getLogs());
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeLogs((nextEntries) => {
      setEntries(nextEntries);
    });
    return unsubscribe;
  }, []);

  const visibleEntries = useMemo(() => [...entries].reverse(), [entries]);

  const handleCopy = async () => {
    const payload = JSON.stringify(visibleEntries, null, 2);
    await Clipboard.setStringAsync(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handlePing = async () => {
    if (pinging) {
      return;
    }
    setPinging(true);
    try {
      await apiPing({
        startId: "IOS_DIAG_PING_START",
        okId: "IOS_DIAG_PING_OK",
        failId: "IOS_DIAG_PING_FAIL"
      });
    } finally {
      setPinging(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, typography.h2]}>Client Logs</Text>
        <View style={styles.headerButtons}>
          <DSButton label={pinging ? "Pinging..." : "API Ping"} onPress={handlePing} variant="secondary" />
          <DSButton label={copied ? "Copied" : "Copy"} onPress={handleCopy} variant="secondary" />
        </View>
      </View>
      <Text style={[styles.caption, typography.caption]}>Showing last {visibleEntries.length} entries.</Text>
      <FlatList
        data={visibleEntries}
        keyExtractor={(item) => `${item.timestamp}-${item.fe_log_id}`}
        renderItem={({ item }) => (
          <DSCard style={styles.logRow}>
            <Text style={[styles.logMeta, typography.caption]}>
              {item.timestamp} - {item.level.toUpperCase()} - {item.fe_log_id}
            </Text>
            <Text style={[styles.logMessage, typography.body]}>{item.message}</Text>
            {item.data && <Text style={[styles.logData, typography.caption]}>{JSON.stringify(item.data)}</Text>}
          </DSCard>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s2
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s1
  },
  title: {
    color: colors.text
  },
  caption: {
    color: colors.muted,
    marginBottom: spacing.s2
  },
  logRow: {
    marginBottom: spacing.s2
  },
  logMeta: {
    color: colors.muted,
    marginBottom: spacing.s1
  },
  logMessage: {
    color: colors.text,
    marginBottom: spacing.s1
  },
  logData: {
    color: colors.muted
  }
});

export default DiagnosticsScreen;
