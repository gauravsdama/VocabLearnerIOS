import React from "react";
import { StyleSheet, View } from "react-native";
import { FeedCard as FeedCardType, QuizSubmitResponse, SentenceSubmitResponse } from "../api/types";
import DSButton from "../components/ui/DSButton";
import DSCard from "../components/ui/DSCard";
import DSPill from "../components/ui/DSPill";
import { spacing } from "../theme/tokens";
import WordCard from "./WordCard";
import QuizCard from "./QuizCard";
import SentenceCard from "./SentenceCard";

const FeedCard = ({
  card,
  onSkip,
  onQuizSubmit,
  onSentenceSubmit
}: {
  card: FeedCardType;
  onSkip: () => void;
  onQuizSubmit: (payload: { feed_card_id: string; question_id: string; chosen_index: number }) => Promise<QuizSubmitResponse>;
  onSentenceSubmit: (payload: { feed_card_id: string; word_id: string; sentence_text: string }) => Promise<SentenceSubmitResponse>;
}) => {
  const accent = card.card_type === "WORD" ? "word" : card.card_type === "QUIZ_MCQ" ? "quiz" : "sentence";
  const pillTone = card.card_type === "WORD" ? "primary" : card.card_type === "QUIZ_MCQ" ? "indigo" : "amber";
  const progressLabel = `#${card.position_index + 1}`;

  return (
    <DSCard accent={accent} style={styles.card}>
      <View style={styles.header}>
        <DSPill label={card.card_type.replace(/_/g, " ")} tone={pillTone} />
        <DSPill label={progressLabel} />
        <DSButton label="Skip" variant="ghost" size="md" onPress={onSkip} />
      </View>
      <View style={styles.body}>
        {card.card_type === "WORD" && card.word && <WordCard word={card.word} progress={card.progress} />}
        {card.card_type === "QUIZ_MCQ" && card.quiz && (
          <QuizCard
            quiz={card.quiz}
            onSubmit={(chosenIndex) =>
              onQuizSubmit({
                feed_card_id: card.card_id,
                question_id: card.quiz?.question_id || "",
                chosen_index: chosenIndex
              })
            }
          />
        )}
        {card.card_type === "WRITE_SENTENCE" && card.write_sentence && (
          <SentenceCard
            sentence={card.write_sentence}
            onSubmit={(text) =>
              onSentenceSubmit({
                feed_card_id: card.card_id,
                word_id: card.word?.word_id || "",
                sentence_text: text
              })
            }
          />
        )}
      </View>
    </DSCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.s3
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.s2,
    gap: spacing.s1
  },
  body: {
    flex: 1
  }
});

export default FeedCard;
