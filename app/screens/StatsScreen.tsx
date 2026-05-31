import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import InlineError from "../components/InlineError";
import DSCard from "../components/ui/DSCard";
import DSButton from "../components/ui/DSButton";
import WordProgressModal from "../components/WordProgressModal";
import { apiFetch } from "../api/client";
import {
  StatsSummary,
  StudyProgressListItem,
  StudyProgressListResponse,
  StudyProgressPatchRequest,
  StudyProgressPatchResponse,
  StudyProgressStatus
} from "../api/types";
import { colors, radius, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

type AssignedFilter = "any" | "only" | "exclude";

type SortKey =
  | "recent"
  | "highest_mastery"
  | "lowest_mastery"
  | "highest_learned"
  | "lowest_learned"
  | "most_seen"
  | "least_seen"
  | "highest_accuracy"
  | "lowest_accuracy";

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "recent", label: "Recent" },
  { key: "highest_mastery", label: "Highest mastery" },
  { key: "lowest_mastery", label: "Lowest mastery" },
  { key: "highest_learned", label: "Highest learned" },
  { key: "lowest_learned", label: "Lowest learned" },
  { key: "most_seen", label: "Most seen" },
  { key: "least_seen", label: "Least seen" },
  { key: "highest_accuracy", label: "Highest accuracy" },
  { key: "lowest_accuracy", label: "Lowest accuracy" }
];

const assignedOptions: Array<{ key: AssignedFilter; label: string }> = [
  { key: "any", label: "Any" },
  { key: "only", label: "Assigned only" },
  { key: "exclude", label: "Exclude assigned" }
];

const statusOptions: Array<{ key: "all" | StudyProgressStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "learning", label: "Learning" },
  { key: "reviewing", label: "Reviewing" },
  { key: "mastered", label: "Mastered" }
];

const toAccuracyPercent = (accuracy?: number | null) => {
  if (typeof accuracy !== "number") {
    return null;
  }
  if (!Number.isFinite(accuracy)) {
    return null;
  }
  const normalized = accuracy <= 1 ? accuracy * 100 : accuracy;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

const StatsScreen = () => {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [items, setItems] = useState<StudyProgressListItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<StudyProgressListItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [assignedFilter, setAssignedFilter] = useState<AssignedFilter>("any");
  const [statusFilter, setStatusFilter] = useState<"all" | StudyProgressStatus>("all");
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [assignedSheetVisible, setAssignedSheetVisible] = useState(false);
  const [statusSheetVisible, setStatusSheetVisible] = useState(false);

  const loadStats = useCallback(async () => {
    const data = await apiFetch<StatsSummary>("/stats/summary", { method: "GET" }, {
      startId: "IOS_STATS_LOAD_START",
      okId: "IOS_STATS_LOAD_OK",
      failId: "IOS_STATS_LOAD_FAIL"
    });
    setStats(data);
  }, []);

  const loadProgressList = useCallback(async () => {
    const params: Record<string, string> = {
      status: statusFilter,
      page: "1",
      page_size: "50",
      sort: sortKey,
      assigned_first: "true"
    };
    const q = searchText.trim();
    if (q.length > 0) {
      params.q = q;
    }
    if (assignedFilter !== "any") {
      params.assigned = assignedFilter;
    }
    const query = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
    const data = await apiFetch<StudyProgressListResponse>(`/study/progress/list?${query}`, { method: "GET" }, {
      startId: "IOS_PROGRESS_LIST_START",
      okId: "IOS_PROGRESS_LIST_OK",
      failId: "IOS_PROGRESS_LIST_FAIL"
    });
    setItems(data.items || []);
    setTotal(typeof data.total === "number" ? data.total : null);
  }, [assignedFilter, searchText, sortKey, statusFilter]);

  const loadAll = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadProgressList()]);
    } catch (err: any) {
      setError(err?.message || "Unable to load stats.");
    } finally {
      setLoading(false);
    }
  }, [loadProgressList, loadStats]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (loading) {
      return;
    }
    const timer = setTimeout(() => {
      void (async () => {
        try {
          await loadProgressList();
        } catch (err: any) {
          setError(err?.message || "Unable to load words.");
        }
      })();
    }, 350);
    return () => clearTimeout(timer);
  }, [assignedFilter, loadProgressList, loading, searchText, sortKey, statusFilter]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    try {
      await Promise.all([loadStats(), loadProgressList()]);
    } catch (err: any) {
      setError(err?.message || "Unable to refresh.");
    } finally {
      setRefreshing(false);
    }
  }, [loadProgressList, loadStats, refreshing]);

  const applyProgressUpdate = useCallback((wordId: number, response: StudyProgressPatchResponse) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.word_id !== wordId) {
          return item;
        }
        const progress = response.progress;
        return {
          ...item,
          status: progress.status,
          seen_count: progress.seen_count,
          next_due_at: progress.next_due_at,
          learned_rating: progress.learned_rating,
          mastery_rating: progress.mastery_rating,
          quiz_attempt_count: progress.quiz_attempt_count,
          quiz_correct_count: progress.quiz_correct_count,
          correct_streak_spaced: progress.correct_streak_spaced,
          last_viewed_at: progress.last_viewed_at
        };
      })
    );
  }, []);

  const patchProgress = useCallback(
    async (wordId: number, payload: StudyProgressPatchRequest) => {
      const key = String(wordId);
      if (updatingIds[key]) {
        return;
      }
      setUpdatingIds((prev) => ({ ...prev, [key]: true }));
      try {
        const response = await apiFetch<StudyProgressPatchResponse>(`/study/progress/${wordId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        }, {
          startId: "IOS_PROGRESS_PATCH_START",
          okId: "IOS_PROGRESS_PATCH_OK",
          failId: "IOS_PROGRESS_PATCH_FAIL"
        });
        applyProgressUpdate(wordId, response);
      } finally {
        setUpdatingIds((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [applyProgressUpdate, updatingIds]
  );

  const openModal = useCallback((item: StudyProgressListItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  const refreshStatsAndList = useCallback(async () => {
    await Promise.all([loadStats(), loadProgressList()]);
  }, [loadProgressList, loadStats]);

  const activeSortLabel = useMemo(() => sortOptions.find((option) => option.key === sortKey)?.label || "Recent", [sortKey]);
  const activeAssignedLabel = useMemo(
    () => assignedOptions.find((option) => option.key === assignedFilter)?.label || "Any",
    [assignedFilter]
  );
  const activeStatusLabel = useMemo(
    () => statusOptions.find((option) => option.key === statusFilter)?.label || "All",
    [statusFilter]
  );

  const header = useMemo(() => {
    return (
      <View>
        <InlineError message={error} />
        {stats ? (
          <View style={styles.grid}>
            {typeof stats.streak === "object" && stats.streak ? (
              <>
                <DSCard style={styles.card}>
                  <Text style={[styles.label, typography.label]}>Streak (Current)</Text>
                  <Text style={[styles.value, typography.h2]}>{stats.streak.current_days}</Text>
                </DSCard>
                <DSCard style={styles.card}>
                  <Text style={[styles.label, typography.label]}>Streak (Longest)</Text>
                  <Text style={[styles.value, typography.h2]}>{stats.streak.longest_days}</Text>
                </DSCard>
              </>
            ) : (
              <DSCard style={styles.card}>
                <Text style={[styles.label, typography.label]}>Streak</Text>
                <Text style={[styles.value, typography.h2]}>{stats.streak}</Text>
              </DSCard>
            )}
            <DSCard style={styles.card}>
              <Text style={[styles.label, typography.label]}>Mastered</Text>
              <Text style={[styles.value, typography.h2]}>{stats.mastered_count}</Text>
            </DSCard>
            <DSCard style={styles.card}>
              <Text style={[styles.label, typography.label]}>Learning</Text>
              <Text style={[styles.value, typography.h2]}>{stats.learning_count}</Text>
            </DSCard>
            <DSCard style={styles.card}>
              <Text style={[styles.label, typography.label]}>Due</Text>
              <Text style={[styles.value, typography.h2]}>{stats.due_count}</Text>
            </DSCard>
            <DSCard style={styles.card}>
              <Text style={[styles.label, typography.label]}>Accuracy</Text>
              <Text style={[styles.value, typography.h2]}>
                {Math.round(stats.accuracy <= 1 ? stats.accuracy * 100 : stats.accuracy)}%
              </Text>
            </DSCard>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h2]}>All Words</Text>
          <Text style={[styles.sectionMeta, typography.caption]}>
            {typeof total === "number" ? `${items.length} of ${total}` : `${items.length}`}
          </Text>
        </View>

        <DSCard style={styles.controlsCard}>
          <Text style={[styles.controlsLabel, typography.label]}>Search</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by word…"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.searchInput, typography.body]}
            returnKeyType="search"
          />
          <View style={styles.controlRow}>
            <DSButton label={`Status: ${activeStatusLabel}`} onPress={() => setStatusSheetVisible(true)} variant="secondary" style={styles.controlButton} />
            <DSButton label={`Assigned: ${activeAssignedLabel}`} onPress={() => setAssignedSheetVisible(true)} variant="secondary" style={styles.controlButton} />
          </View>
          <View style={styles.controlRow}>
            <DSButton label={`Sort: ${activeSortLabel}`} onPress={() => setSortSheetVisible(true)} variant="secondary" style={styles.controlButton} />
            <DSButton
              label="Clear"
              onPress={() => {
                setSearchText("");
                setSortKey("recent");
                setAssignedFilter("any");
                setStatusFilter("all");
              }}
              variant="ghost"
              style={styles.controlButton}
            />
          </View>
        </DSCard>
      </View>
    );
  }, [
    activeAssignedLabel,
    activeSortLabel,
    activeStatusLabel,
    error,
    items.length,
    searchText,
    stats,
    total
  ]);

  return (
    <ScreenContainer>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.word_id)}
          ListHeaderComponent={header}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
          ListEmptyComponent={
            <DSCard style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, typography.body]}>No words to show yet.</Text>
              <Text style={[styles.emptySubtitle, typography.caption]}>
                Once you start the feed, your learning and reviewing words will appear here.
              </Text>
            </DSCard>
          }
          renderItem={({ item }) => {
            const key = String(item.word_id);
            const isUpdating = !!updatingIds[key];
            const accuracyPct = toAccuracyPercent(item.accuracy);
            return (
              <DSCard style={styles.wordCard}>
                <View style={styles.wordHeaderRow}>
                  <View style={styles.wordHeaderText}>
                    <View style={styles.wordTitleRow}>
                      <Text style={[styles.wordTitle, typography.h2]}>{item.word}</Text>
                      {item.is_assigned ? (
                        <View style={styles.assignedPill}>
                          <Text style={[styles.assignedText, typography.caption]}>Assigned</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.wordDefinition, typography.body]}>{item.primary_definition}</Text>
                    <Text style={[styles.wordMeta, typography.caption]}>
                      {`${item.status} • seen ${item.seen_count}${
                        typeof item.viewed_count === "number" ? ` • viewed ${item.viewed_count}` : ""
                      }${
                        typeof item.quiz_attempt_count === "number" ? ` • quizzes ${item.quiz_attempt_count}` : ""
                      }${accuracyPct === null ? "" : ` • acc ${accuracyPct}%`}${
                        item.next_due_at ? ` • due ${item.next_due_at}` : ""
                      }`}
                    </Text>
                  </View>
                  <DSButton label="Manage" onPress={() => openModal(item)} variant="ghost" style={styles.manageButton} />
                </View>

                <View style={styles.adjustRow}>
                  <Text style={[styles.adjustLabel, typography.caption]}>
                    {`Learned ${typeof item.learned_rating === "number" ? item.learned_rating : "-"}`}
                  </Text>
                  <View style={styles.adjustButtons}>
                    <DSButton
                      label="-1"
                      onPress={() => void patchProgress(item.word_id, { learned_delta: -1 })}
                      variant="secondary"
                      disabled={isUpdating}
                    />
                    <DSButton
                      label="+1"
                      onPress={() => void patchProgress(item.word_id, { learned_delta: 1 })}
                      variant="secondary"
                      disabled={isUpdating}
                    />
                  </View>
                </View>

                <View style={styles.adjustRow}>
                  <Text style={[styles.adjustLabel, typography.caption]}>
                    {`Mastery ${typeof item.mastery_rating === "number" ? item.mastery_rating : "-"}`}
                  </Text>
                  <View style={styles.adjustButtons}>
                    <DSButton
                      label="-1"
                      onPress={() => void patchProgress(item.word_id, { mastery_delta: -1 })}
                      variant="secondary"
                      disabled={isUpdating}
                    />
                    <DSButton
                      label="+1"
                      onPress={() => void patchProgress(item.word_id, { mastery_delta: 1 })}
                      variant="secondary"
                      disabled={isUpdating}
                    />
                  </View>
                </View>
              </DSCard>
            );
          }}
        />
      )}
      <WordProgressModal
        visible={modalVisible}
        item={selectedItem}
        onClose={closeModal}
        onProgressUpdated={applyProgressUpdate}
        onAfterMutation={refreshStatsAndList}
      />
      <Modal visible={sortSheetVisible} transparent animationType="fade" onRequestClose={() => setSortSheetVisible(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setSortSheetVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={[styles.sheetTitle, typography.h2]}>Sort</Text>
            <View style={styles.sheetList}>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    setSortKey(option.key);
                    setSortSheetVisible(false);
                  }}
                  style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
                >
                  <Text style={[styles.sheetOptionText, typography.body]}>{option.label}</Text>
                  {sortKey === option.key ? <Text style={[styles.sheetOptionCheck, typography.body]}>✓</Text> : null}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={assignedSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAssignedSheetVisible(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setAssignedSheetVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={[styles.sheetTitle, typography.h2]}>Assigned filter</Text>
            <View style={styles.sheetList}>
              {assignedOptions.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    setAssignedFilter(option.key);
                    setAssignedSheetVisible(false);
                  }}
                  style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
                >
                  <Text style={[styles.sheetOptionText, typography.body]}>{option.label}</Text>
                  {assignedFilter === option.key ? <Text style={[styles.sheetOptionCheck, typography.body]}>✓</Text> : null}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={statusSheetVisible} transparent animationType="fade" onRequestClose={() => setStatusSheetVisible(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setStatusSheetVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={[styles.sheetTitle, typography.h2]}>Status</Text>
            <View style={styles.sheetList}>
              {statusOptions.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    setStatusFilter(option.key);
                    setStatusSheetVisible(false);
                  }}
                  style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
                >
                  <Text style={[styles.sheetOptionText, typography.body]}>{option.label}</Text>
                  {statusFilter === option.key ? <Text style={[styles.sheetOptionCheck, typography.body]}>✓</Text> : null}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s2
  },
  card: {
    width: "46%",
    padding: spacing.s2
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: spacing.s3,
    marginBottom: spacing.s2
  },
  sectionTitle: {
    color: colors.text
  },
  sectionMeta: {
    color: colors.muted
  },
  controlsCard: {
    padding: spacing.s3,
    marginBottom: spacing.s2
  },
  controlsLabel: {
    color: colors.muted,
    marginBottom: spacing.s1
  },
  searchInput: {
    backgroundColor: colors.surface2,
    borderRadius: radius.rBtn,
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.s2 - 2,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    marginBottom: spacing.s2
  },
  controlRow: {
    flexDirection: "row",
    gap: spacing.s1,
    marginBottom: spacing.s1
  },
  controlButton: {
    flex: 1
  },
  listContent: {
    paddingBottom: spacing.s4
  },
  emptyCard: {
    padding: spacing.s3
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.s1
  },
  emptySubtitle: {
    color: colors.muted
  },
  wordCard: {
    padding: spacing.s3,
    marginBottom: spacing.s2
  },
  wordHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.s2
  },
  wordHeaderText: {
    flex: 1,
    gap: spacing.s1 - 2
  },
  wordTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s1,
    flexWrap: "wrap"
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
  manageButton: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.s2 - 2,
    paddingVertical: spacing.s1 - 2
  },
  wordTitle: {
    color: colors.text
  },
  wordDefinition: {
    color: colors.muted
  },
  wordMeta: {
    color: colors.muted
  },
  adjustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.s1
  },
  adjustLabel: {
    color: colors.muted
  },
  adjustButtons: {
    flexDirection: "row",
    gap: spacing.s1
  },
  label: {
    color: colors.muted,
    marginBottom: spacing.s1
  },
  value: {
    color: colors.text
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "flex-end",
    padding: spacing.s2
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.rCard,
    padding: spacing.s3,
    borderWidth: 1,
    borderColor: colors.border
  },
  sheetTitle: {
    color: colors.text,
    marginBottom: spacing.s2
  },
  sheetList: {
    gap: 6
  },
  sheetOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.s1,
    paddingHorizontal: spacing.s1,
    borderRadius: radius.rBtn
  },
  sheetOptionPressed: {
    backgroundColor: colors.primaryTint
  },
  sheetOptionText: {
    color: colors.text
  },
  sheetOptionCheck: {
    color: colors.primary,
    fontWeight: "700"
  }
});

export default StatsScreen;
