import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { apiFetch } from "../api/client";
import {
  FeedCard as FeedCardType,
  FeedNextResponse,
  FeedSessionResponse,
  MessageDTO,
  QuizSubmitResponse,
  SentenceSubmitResponse
} from "../api/types";
import FeedCard from "../feed/FeedCard";
import EndCard from "../feed/EndCard";
import { getScreenSize } from "../utils/layout";
import { colors, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";
import { useMessages } from "../messages/MessageContext";
import { extractMessages } from "../messages/messageUtils";

const PAGE_LIMIT = 10;

type EndCardItem = { id: "end"; type: "END" };
type FeedItem = FeedCardType | EndCardItem;

const appendUniqueCards = (cards: FeedCardType[], cardIdSet: Set<string>) => {
  const unique: FeedCardType[] = [];
  cards.forEach((card) => {
    if (cardIdSet.has(card.card_id)) {
      return;
    }
    cardIdSet.add(card.card_id);
    unique.push(card);
  });
  return unique;
};

const isEndItem = (item: FeedItem): item is EndCardItem => {
  return "type" in item && item.type === "END";
};

const isLimitMessage = (message: MessageDTO) => {
  const code = message.code?.toLowerCase();
  if (code && code.includes("limit")) {
    return true;
  }
  const text = [message.title, message.body, message.message].filter(Boolean).join(" ").toLowerCase();
  return text.includes("limit") || text.includes("quota");
};

const getEndSubtitle = (messages?: MessageDTO[]) => {
  if (!messages) {
    return null;
  }
  const limitMessage = messages.find(isLimitMessage);
  if (!limitMessage) {
    return null;
  }
  return limitMessage.body || limitMessage.message || "Daily limit reached. Pull to refresh later.";
};

const getLastPositionIndex = (cards: FeedCardType[]) => {
  if (cards.length === 0) {
    return -1;
  }
  return Math.max(...cards.map((card) => card.position_index));
};

const FeedScreen = () => {
  const { height } = getScreenSize();
  const cardSpacing = spacing.s2;
  const cardHeight = height - 160;
  const listRef = useRef<FlatList<FeedItem>>(null);
  const [cards, setCards] = useState<FeedCardType[]>([]);
  const [feedSessionId, setFeedSessionId] = useState<string | null>(null);
  const [lastLoadedPositionIndex, setLastLoadedPositionIndex] = useState(-1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [endSubtitle, setEndSubtitle] = useState<string | null>(null);
  const viewedCards = useRef<Set<string>>(new Set());
  const activeCardRef = useRef<FeedCardType | null>(null);
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCardIdRef = useRef<string | null>(null);
  const cardIdSet = useRef<Set<string>>(new Set());
  const endedSessions = useRef<Set<string>>(new Set());
  const endSessionRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const { ingestMessages } = useMessages();

  const endSession = useCallback(async () => {
    if (!feedSessionId || endedSessions.current.has(feedSessionId)) {
      return;
    }
    endedSessions.current.add(feedSessionId);
    try {
      await apiFetch("/feed/end", {
        method: "POST",
        body: JSON.stringify({ feed_session_id: feedSessionId })
      }, {
        eventId: "IOS_FEED_END"
      });
    } catch {
      // best-effort end
    }
  }, [feedSessionId]);

  useEffect(() => {
    endSessionRef.current = endSession;
  }, [endSession]);

  const loadSession = useCallback(async (showLoading = true) => {
    setError(null);
    if (showLoading) {
      setLoading(true);
    }
    try {
      viewedCards.current = new Set();
      cardIdSet.current = new Set();
      setCards([]);
      setActiveIndex(0);
      setHasMore(true);
      setLastLoadedPositionIndex(-1);
      setEndSubtitle(null);
      const resume = await apiFetch<FeedSessionResponse>("/feed/resume", {
        method: "POST",
        body: JSON.stringify({ mode: "mixed", limit: PAGE_LIMIT })
      }, {
        startId: "IOS_FEED_RESUME_START",
        okId: "IOS_FEED_RESUME_OK",
        failId: "IOS_FEED_RESUME_FAIL"
      });
      const resumeMessages = extractMessages(resume);
      ingestMessages(resumeMessages);
      setEndSubtitle(getEndSubtitle(resumeMessages));

      if (!resume.cards || resume.cards.length === 0) {
        const start = await apiFetch<FeedSessionResponse>("/feed/start", {
          method: "POST",
          body: JSON.stringify({ mode: "mixed", limit: PAGE_LIMIT })
        }, {
          startId: "IOS_FEED_START_START",
          okId: "IOS_FEED_START_OK",
          failId: "IOS_FEED_START_FAIL"
        });
        const startMessages = extractMessages(start);
        ingestMessages(startMessages);
        setEndSubtitle(getEndSubtitle(startMessages));
        const uniqueCards = appendUniqueCards(start.cards || [], cardIdSet.current);
        setFeedSessionId(start.feed_session_id);
        setCards(uniqueCards);
        const nextIndex = getLastPositionIndex(uniqueCards);
        setLastLoadedPositionIndex(nextIndex);
        setHasMore(uniqueCards.length > 0);
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
        return;
      }

      const uniqueCards = appendUniqueCards(resume.cards || [], cardIdSet.current);
      setFeedSessionId(resume.feed_session_id);
      setCards(uniqueCards);
      const nextIndex = getLastPositionIndex(uniqueCards);
      setLastLoadedPositionIndex(nextIndex);
      setHasMore(uniqueCards.length > 0);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    } catch (err: any) {
      setError(err?.message || "Unable to load feed.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [ingestMessages]);

  useEffect(() => {
    void loadSession();
    return () => {
      void endSessionRef.current();
    };
  }, [loadSession]);

  const loadMore = useCallback(async () => {
    if (!feedSessionId || loadingMore || !hasMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const response = await apiFetch<FeedNextResponse>(
        `/feed/${feedSessionId}/next?after_index=${lastLoadedPositionIndex}&limit=${PAGE_LIMIT}`,
        { method: "GET" },
        {
          startId: "IOS_FEED_NEXT_START",
          okId: "IOS_FEED_NEXT_OK",
          failId: "IOS_FEED_NEXT_FAIL"
        }
      );
      const nextMessages = extractMessages(response);
      ingestMessages(nextMessages);
      setEndSubtitle((prev) => prev || getEndSubtitle(nextMessages));
      const nextCards = appendUniqueCards(response.cards || [], cardIdSet.current);
      if (nextCards.length === 0) {
        setHasMore(false);
      } else {
        setCards((prev) => [...prev, ...nextCards]);
        setLastLoadedPositionIndex((prevIndex) => Math.max(prevIndex, getLastPositionIndex(nextCards)));
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [feedSessionId, lastLoadedPositionIndex, hasMore, loadingMore, ingestMessages]);

  const markViewed = useCallback(
    async (card: FeedCardType, viewDurationMs?: number) => {
      if (viewedCards.current.has(card.card_id) || !feedSessionId) {
        return;
      }
      viewedCards.current.add(card.card_id);
      try {
        await apiFetch("/feed/mark_viewed", {
          method: "POST",
          body: JSON.stringify({
            feed_session_id: feedSessionId,
            feed_card_id: card.card_id,
            ...(typeof viewDurationMs === "number" ? { view_duration_ms: viewDurationMs } : {})
          })
        }, {
          eventId: "IOS_FEED_MARK_VIEWED"
        });
      } catch {
        // ignore view tracking errors
      }
    },
    [feedSessionId]
  );

  const clearViewTimer = useCallback(() => {
    if (viewTimerRef.current) {
      clearTimeout(viewTimerRef.current);
      viewTimerRef.current = null;
    }
    pendingCardIdRef.current = null;
  }, []);

  const scheduleWordViewed = useCallback(
    (card: FeedCardType) => {
      if (viewedCards.current.has(card.card_id)) {
        return;
      }
      if (pendingCardIdRef.current === card.card_id) {
        return;
      }
      clearViewTimer();
      pendingCardIdRef.current = card.card_id;
      viewTimerRef.current = setTimeout(() => {
        if (activeCardRef.current?.card_id !== card.card_id) {
          return;
        }
        pendingCardIdRef.current = null;
        void markViewed(card, 7000);
      }, 7000);
    },
    [clearViewTimer, markViewed]
  );

  const handleQuizSubmit = async (payload: {
    feed_card_id: string;
    question_id: string;
    chosen_index: number;
  }): Promise<QuizSubmitResponse> => {
    return await apiFetch<QuizSubmitResponse>("/quiz/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    }, {
      startId: "IOS_QUIZ_SUBMIT_START",
      okId: "IOS_QUIZ_SUBMIT_OK",
      failId: "IOS_QUIZ_SUBMIT_FAIL"
    });
  };

  const handleSentenceSubmit = async (payload: {
    feed_card_id: string;
    word_id: string;
    sentence_text: string;
  }): Promise<SentenceSubmitResponse> => {
    return await apiFetch<SentenceSubmitResponse>("/sentence/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    }, {
      startId: "IOS_SENT_SUBMIT_START",
      okId: "IOS_SENT_SUBMIT_OK",
      failId: "IOS_SENT_SUBMIT_FAIL"
    });
  };

  const handleSkip = async (card: FeedCardType, index: number) => {
    if (feedSessionId) {
      try {
        await apiFetch("/feed/mark_skipped", {
          method: "POST",
          body: JSON.stringify({ feed_session_id: feedSessionId, feed_card_id: card.card_id })
        }, {
          eventId: "IOS_FEED_MARK_SKIPPED"
        });
      } catch {
        // skip error should not block navigation
      }
    }
    const maxIndex = hasMore ? cards.length - 1 : cards.length;
    const nextIndex = Math.min(index + 1, Math.max(0, maxIndex));
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await endSession();
    await loadSession(false);
    setRefreshing(false);
  };

  const feedItems: FeedItem[] = useMemo(() => {
    if (!hasMore) {
      return cards.length > 0 ? [...cards, { id: "end", type: "END" }] : [{ id: "end", type: "END" }];
    }
    return cards;
  }, [cards, hasMore]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null; item: FeedItem }> }) => {
      const first = viewableItems[0];
      if (!first || first.index === null) {
        return;
      }
      setActiveIndex(first.index);
      if (isEndItem(first.item)) {
        activeCardRef.current = null;
        clearViewTimer();
        return;
      }
      activeCardRef.current = first.item;
      if (first.item.card_type === "WORD") {
        scheduleWordViewed(first.item);
      } else {
        clearViewTimer();
        void markViewed(first.item);
      }
    },
    [clearViewTimer, markViewed, scheduleWordViewed]
  );

  useEffect(() => {
    if (activeIndex >= cards.length - 3 && hasMore) {
      void loadMore();
    }
  }, [activeIndex, cards.length, hasMore, loadMore]);

  useEffect(() => {
    return () => {
      clearViewTimer();
    };
  }, [clearViewTimer]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={[styles.error, typography.body]}>{error}</Text>
        <Text style={[styles.retry, typography.body]} onPress={() => void loadSession()}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={feedItems}
        snapToInterval={cardHeight + cardSpacing}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => (isEndItem(item) ? item.id : item.card_id)}
        contentContainerStyle={{ paddingVertical: cardSpacing }}
        renderItem={({ item, index }) =>
          isEndItem(item) ? (
            <View style={{ height: cardHeight, marginVertical: cardSpacing / 2 }}>
              <EndCard subtitle={endSubtitle || undefined} />
            </View>
          ) : (
            <View style={{ height: cardHeight, marginVertical: cardSpacing / 2 }}>
              <FeedCard
                card={item}
                onSkip={() => void handleSkip(item, index)}
                onQuizSubmit={handleQuizSubmit}
                onSentenceSubmit={handleSentenceSubmit}
              />
            </View>
          )
        }
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged}
        getItemLayout={(_, index) => ({
          length: cardHeight + cardSpacing,
          offset: (cardHeight + cardSpacing) * index,
          index
        })}
        onScrollToIndexFailed={() => {
          // ignore
        }}
        refreshing={refreshing}
        onRefresh={() => void handleRefresh()}
      />
      {loadingMore && <ActivityIndicator style={styles.loadingMore} color={colors.primary} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
    padding: spacing.s3
  },
  error: {
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.s2
  },
  retry: {
    color: colors.primary,
    fontWeight: "600"
  },
  loadingMore: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center"
  }
});

export default FeedScreen;
