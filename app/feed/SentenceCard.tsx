import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import DSButton from "../components/ui/DSButton";
import DSPill from "../components/ui/DSPill";
import { FeedWriteSentence, SentenceSubmitResponse } from "../api/types";
import { colors, radius, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

const SentenceCard = ({
  sentence,
  onSubmit
}: {
  sentence: FeedWriteSentence;
  onSubmit: (text: string) => Promise<SentenceSubmitResponse>;
}) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SentenceSubmitResponse | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DSPill label="Sentence" tone="amber" />
      </View>
      <Text style={[styles.prompt, typography.h1]}>{sentence.prompt}</Text>
      <TextInput
        style={styles.input}
        placeholder="Type your sentence"
        placeholderTextColor={colors.muted}
        value={text}
        onChangeText={setText}
        multiline
      />
      <DSButton
        label={submitting ? "Submitting..." : "Submit"}
        onPress={async () => {
          if (!text.trim() || submitting) {
            return;
          }
          setSubmitting(true);
          try {
            const response = await onSubmit(text.trim());
            setResult(response);
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={!text.trim() || submitting}
      />
      {result && (
        <View style={styles.resultBox}>
          <Text style={[styles.score, typography.h2]}>{`Score: ${result.score}`}</Text>
          {result.feedback && <Text style={[styles.feedback, typography.body]}>{result.feedback}</Text>}
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
  prompt: {
    marginBottom: spacing.s2
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: radius.rOption,
    padding: spacing.s2,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: spacing.s2,
    fontFamily: typography.body.fontFamily
  },
  resultBox: {
    marginTop: spacing.s2
  },
  score: {
    marginBottom: spacing.s1,
    color: colors.success
  },
  feedback: {
    color: colors.text
  }
});

export default SentenceCard;
