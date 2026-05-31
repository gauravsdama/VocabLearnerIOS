import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiFetch } from "../api/client";
import {
  StudyProgressListItem,
  StudyProgressPatchResponse,
  StudyProgressQuizAttempt,
  StudyProgressQuizAttemptsResponse
} from "../api/types";
import { colors, radius, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";
import DSButton from "./ui/DSButton";
import DSCard from "./ui/DSCard";
import InlineError from "./InlineError";

type Props = {
  visible: boolean;
  item: StudyProgressListItem | null;
  onClose: () => void;
  onProgressUpdated?: (wordId: number, response: StudyProgressPatchResponse) => void;
  onAfterMutation?: () => Promise<void> | void;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

const renderChoiceLabel = (
  choice: string,
  index: number,
  attempt: StudyProgressQuizAttempt
): { text: string; color: string } => {
  const isCorrect = index === attempt.correct_index;
  const isChosen = index === attempt.chosen_index;
  if (isCorrect && isChosen) {
    return { text: `✓ ${choice} (your answer)`, color: colors.success };
  }
  if (isCorrect) {
    return { text: `✓ ${choice} (correct)`, color: colors.success };
  }
  if (isChosen) {
    return { text: `• ${choice} (your answer)`, color: colors.danger };
  }
  return { text: `• ${choice}`, color: colors.muted };
};

const WordProgressModal = ({ visible, item, onClose, onProgressUpdated, onAfterMutation }: Props) => {
  const [downgrading, setDowngrading] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [attempts, setAttempts] = useState<StudyProgressQuizAttempt[]>([]);
  const [attemptsTotal, setAttemptsTotal] = useState<number | null>(null);
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [expandedQuestions, setExpandedQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setError(null);
    setAttemptsError(null);
    setDowngrading(false);
    setLoadingAttempts(false);
    setAttempts([]);
    setAttemptsTotal(null);
    setAttemptsPage(1);
    setExpandedQuestions(false);
  }, [item?.word_id, visible]);

  const canLoadMore = useMemo(() => {
    if (!expandedQuestions) {
      return false;
    }
    if (attemptsTotal === null) {
      return false;
    }
    return attempts.length < attemptsTotal;
  }, [attempts.length, attemptsTotal, expandedQuestions]);

  const loadAttempts = useCallback(
    async (page: number) => {
      if (!item) {
        return;
      }
      setAttemptsError(null);
      setLoadingAttempts(true);
      try {
        const response = await apiFetch<StudyProgressQuizAttemptsResponse>(
          `/study/progress/${item.word_id}/quiz-attempts?page=${page}&page_size=20`,
          { method: "GET" },
          {
            startId: "IOS_PROGRESS_ATTEMPTS_START",
            okId: "IOS_PROGRESS_ATTEMPTS_OK",
            failId: "IOS_PROGRESS_ATTEMPTS_FAIL"
          }
        );
        setAttemptsTotal(typeof response.total === "number" ? response.total : null);
        setAttemptsPage(response.page || page);
        setAttempts((prev) => (page === 1 ? response.attempts || [] : [...prev, ...(response.attempts || [])]));
      } catch (err: any) {
        setAttemptsError(err?.message || "Unable to load question history.");
      } finally {
        setLoadingAttempts(false);
      }
    },
    [item]
  );

  const handleToggleQuestions = useCallback(async () => {
    if (!item) {
      return;
    }
    setExpandedQuestions((prev) => !prev);
    if (!expandedQuestions && attempts.length === 0 && !loadingAttempts) {
      await loadAttempts(1);
    }
  }, [attempts.length, expandedQuestions, item, loadAttempts, loadingAttempts]);

  const handleLoadMore = useCallback(async () => {
    if (!canLoadMore || loadingAttempts) {
      return;
    }
    await loadAttempts(attemptsPage + 1);
  }, [attemptsPage, canLoadMore, loadAttempts, loadingAttempts]);

  const handleDowngrade = useCallback(async () => {
    if (!item || downgrading) {
      return;
    }
    setError(null);
    setDowngrading(true);
    try {
      const response = await apiFetch<StudyProgressPatchResponse>(
        `/study/progress/${item.word_id}/downgrade`,
        { method: "POST" },
        {
          startId: "IOS_PROGRESS_DOWNGRADE_START",
          okId: "IOS_PROGRESS_DOWNGRADE_OK",
          failId: "IOS_PROGRESS_DOWNGRADE_FAIL"
        }
      );
      onProgressUpdated?.(item.word_id, response);
      await onAfterMutation?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Unable to downgrade word.");
    } finally {
      setDowngrading(false);
    }
  }, [downgrading, item, onAfterMutation, onClose, onProgressUpdated]);

  if (!item) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, typography.h2]}>{item.word}</Text>
                {item.is_assigned ? (
                  <View style={styles.assignedPill}>
                    <Text style={[styles.assignedText, typography.caption]}>Assigned</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.subtitle, typography.body]}>{item.primary_definition}</Text>
              <Text style={[styles.meta, typography.caption]}>
                {`${item.status} • seen ${item.seen_count}${
                  item.next_due_at ? ` • due ${formatDateTime(item.next_due_at)}` : ""
                }`}
              </Text>
            </View>
            <DSButton label="Close" onPress={onClose} variant="ghost" />
          </View>

          <InlineError message={error} />

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <DSCard style={styles.actionCard}>
              <Text style={[styles.actionTitle, typography.body]}>Actions</Text>
              <Text style={[styles.actionHint, typography.caption]}>
                Downgrading resets the word to unlearned so it reappears in the feed.
              </Text>
              <View style={styles.actionButtons}>
                <DSButton
                  label={downgrading ? "Downgrading..." : "Downgrade to unlearned"}
                  onPress={() => void handleDowngrade()}
                  variant="secondary"
                  disabled={downgrading}
                  loading={downgrading}
                  style={styles.actionButton}
                />
                <DSButton
                  label={expandedQuestions ? "Hide questions" : "Questions"}
                  onPress={() => void handleToggleQuestions()}
                  variant="ghost"
                  disabled={downgrading}
                />
              </View>
            </DSCard>

            {expandedQuestions ? (
              <DSCard style={styles.historyCard} accent="quiz">
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyTitle, typography.body]}>Question history</Text>
                  <Text style={[styles.historyMeta, typography.caption]}>
                    {attemptsTotal === null ? "" : `${attempts.length} of ${attemptsTotal}`}
                  </Text>
                </View>
                <InlineError message={attemptsError} />
                {loadingAttempts && attempts.length === 0 ? (
                  <View style={styles.loadingAttempts}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : attempts.length === 0 ? (
                  <Text style={[styles.emptyHistory, typography.caption]}>No quiz attempts yet.</Text>
                ) : (
                  <View style={styles.attemptList}>
                    {attempts.map((attempt) => (
                      <View key={attempt.attempt_id} style={styles.attempt}>
                        <View style={styles.attemptHeader}>
                          <Text
                            style={[
                              styles.attemptResult,
                              typography.caption,
                              attempt.correct ? styles.correct : styles.incorrect
                            ]}
                          >
                            {attempt.correct ? "Correct" : "Incorrect"}
                          </Text>
                          <Text style={[styles.attemptDate, typography.caption]}>{formatDateTime(attempt.created_at)}</Text>
                        </View>
                        <Text style={[styles.prompt, typography.body]}>{attempt.prompt}</Text>
                        <View style={styles.choices}>
                          {attempt.choices.map((choice, index) => {
                            const label = renderChoiceLabel(choice, index, attempt);
                            return (
                              <Text key={`${attempt.attempt_id}_${index}`} style={[styles.choice, typography.caption, { color: label.color }]}>
                                {label.text}
                              </Text>
                            );
                          })}
                        </View>
                        {attempt.explanation ? (
                          <Text style={[styles.explanation, typography.caption]}>{attempt.explanation}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}
                {canLoadMore ? (
                  <View style={styles.loadMoreRow}>
                    <DSButton
                      label={loadingAttempts ? "Loading..." : "Load more"}
                      onPress={() => void handleLoadMore()}
                      variant="secondary"
                      loading={loadingAttempts}
                      disabled={loadingAttempts}
                    />
                  </View>
                ) : null}
              </DSCard>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: colors.bgElev,
    borderTopLeftRadius: radius.rCard,
    borderTopRightRadius: radius.rCard,
    padding: spacing.s3,
    maxHeight: "85%"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.s2,
    marginBottom: spacing.s2
  },
  headerText: {
    flex: 1,
    gap: spacing.s1 - 2
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.s1
  },
  title: {
    color: colors.text
  },
  assignedPill: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.rPill,
    paddingHorizontal: spacing.s1,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  assignedText: {
    color: colors.primary,
    fontWeight: "700"
  },
  subtitle: {
    color: colors.muted
  },
  meta: {
    color: colors.muted
  },
  content: {
    paddingBottom: spacing.s4,
    gap: spacing.s2
  },
  actionCard: {
    padding: spacing.s3
  },
  actionTitle: {
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.s1
  },
  actionHint: {
    color: colors.muted,
    marginBottom: spacing.s2
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.s2
  },
  actionButton: {
    flex: 1
  },
  historyCard: {
    padding: spacing.s3
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.s2
  },
  historyTitle: {
    color: colors.text,
    fontWeight: "600"
  },
  historyMeta: {
    color: colors.muted
  },
  loadingAttempts: {
    paddingVertical: spacing.s3,
    alignItems: "center"
  },
  emptyHistory: {
    color: colors.muted
  },
  attemptList: {
    gap: spacing.s2
  },
  attempt: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s2
  },
  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s1
  },
  attemptResult: {
    fontWeight: "700"
  },
  correct: {
    color: colors.success
  },
  incorrect: {
    color: colors.danger
  },
  attemptDate: {
    color: colors.muted
  },
  prompt: {
    color: colors.text,
    marginBottom: spacing.s1
  },
  choices: {
    gap: 4
  },
  choice: {
    lineHeight: 18
  },
  explanation: {
    marginTop: spacing.s1,
    color: colors.muted
  },
  loadMoreRow: {
    marginTop: spacing.s2,
    alignItems: "center"
  }
});

export default WordProgressModal;
