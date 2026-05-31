import React from "react";
import { StyleSheet, Text, View } from "react-native";
import DSPill from "../components/ui/DSPill";
import { FeedProgress, FeedWord } from "../api/types";
import { colors, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

const WordCard = ({ word, progress }: { word: FeedWord; progress?: FeedProgress }) => {
  const examples = (word.examples || []).slice(0, 3);
  const isMastered = progress?.status?.toLowerCase() === "mastered";
  const partOfSpeech = (() => {
    const raw = word.part_of_speech?.toLowerCase() || "";
    if (raw === "n." || raw === "noun" || raw === "n") return "Noun";
    if (raw === "v." || raw === "verb" || raw === "v") return "Verb";
    if (raw === "adj." || raw === "adjective" || raw === "adj") return "Adjective";
    if (raw === "adv." || raw === "adverb" || raw === "adv") return "Adverb";
    if (!raw) return "Part of speech";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  return (
    <View style={styles.container}>
      <Text style={[styles.word, typography.h1]}>{word.word.toUpperCase()}</Text>
      <View style={styles.pillRow}>
        <DSPill label={partOfSpeech} tone="primary" />
        {isMastered ? <DSPill label="Mastered" tone="success" /> : null}
      </View>
      <Text style={[styles.sectionTitle, typography.label]}>Definition</Text>
      <Text style={[styles.definition, typography.body]}>{word.definition}</Text>
      <Text style={[styles.sectionTitle, typography.label]}>Examples</Text>
      {examples.length === 0 ? (
        <Text style={[styles.exampleText, typography.body]}>No examples yet.</Text>
      ) : (
        examples.map((example, index) => (
          <View key={`${word.word_id}-${index}`} style={styles.exampleRow}>
            <Text style={[styles.exampleIndex, typography.label]}>{index + 1}</Text>
            <Text style={[styles.exampleText, typography.body]}>{example}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.s1
  },
  word: {
    marginBottom: spacing.s1,
    color: colors.text
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s1,
    marginBottom: spacing.s2
  },
  sectionTitle: {
    marginBottom: spacing.s1
  },
  definition: {
    marginBottom: spacing.s2
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.s1
  },
  exampleIndex: {
    width: 20,
    color: colors.muted
  },
  exampleText: {
    flex: 1,
    color: colors.text
  }
});

export default WordCard;
