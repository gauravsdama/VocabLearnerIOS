import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DSButton from "../components/ui/DSButton";
import DSOptionCard from "../components/ui/DSOptionCard";
import DSPill from "../components/ui/DSPill";
import { FeedQuiz, QuizSubmitResponse } from "../api/types";
import { colors, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

const QuizCard = ({
  quiz,
  onSubmit
}: {
  quiz: FeedQuiz;
  onSubmit: (chosenIndex: number) => Promise<QuizSubmitResponse>;
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DSPill label="Question" tone="indigo" />
      </View>
      <Text style={[styles.question, typography.h1]}>{quiz.prompt}</Text>
      <Text style={[styles.sectionTitle, typography.label]}>Choices</Text>
      <View style={styles.choicesGrid}>
        {quiz.choices.map((choice, index) => {
          const isSelected = selectedIndex === index;
          const state = result
            ? isSelected
              ? result.correct
                ? "correct"
                : "incorrect"
              : "disabled"
            : isSelected
              ? "selected"
              : "idle";
          return (
            <View key={`${index}`} style={styles.choiceWrapper}>
              <DSOptionCard label={choice} state={state} onPress={() => setSelectedIndex(index)} />
            </View>
          );
        })}
      </View>
      <DSButton
        label={submitting ? "Submitting..." : "Submit"}
        onPress={async () => {
          if (selectedIndex === null || submitting) {
            return;
          }
          setSubmitting(true);
          try {
            const response = await onSubmit(selectedIndex);
            setResult(response);
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={selectedIndex === null || submitting}
      />
      {result && (
        <View style={styles.resultBox}>
          <Text style={[styles.result, typography.h2, result.correct ? styles.correct : styles.incorrect]}>
            {result.correct ? "Correct" : "Not quite"}
          </Text>
          {result.explanation && <Text style={[styles.explanation, typography.body]}>{result.explanation}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.s1
  },
  header: {
    marginBottom: spacing.s1
  },
  question: {
    marginBottom: spacing.s2
  },
  sectionTitle: {
    marginBottom: spacing.s1
  },
  choicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.s1 + 2,
    marginBottom: spacing.s2
  },
  choiceWrapper: {
    width: "48%"
  },
  resultBox: {
    marginTop: spacing.s2
  },
  result: {
    marginBottom: spacing.s1
  },
  correct: {
    color: colors.success
  },
  incorrect: {
    color: colors.danger
  },
  explanation: {
    color: colors.text
  }
});

export default QuizCard;
