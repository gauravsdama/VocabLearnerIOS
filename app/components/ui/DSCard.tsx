import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "../../theme/tokens";

type Accent = "word" | "quiz" | "sentence";

const accentMap: Record<Accent, { border: string; tint: string }> = {
  word: { border: colors.primary, tint: colors.primaryTint },
  quiz: { border: colors.indigo, tint: colors.indigoTint },
  sentence: { border: colors.amber, tint: colors.amberTint }
};

const DSCard = ({
  children,
  style,
  accent
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: Accent;
}) => {
  const accentStyle = accent ? accentMap[accent] : null;

  return (
    <View
      style={[
        styles.card,
        accent
          ? { borderTopColor: accentStyle?.border, borderTopWidth: 4 }
          : { borderTopColor: colors.border, borderTopWidth: 1 },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.rCard,
    padding: spacing.s3,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow
  }
});

export default DSCard;
