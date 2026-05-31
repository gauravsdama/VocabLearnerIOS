import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";
import { typography } from "../theme/typography";

const TextField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  onSubmitEditing,
  returnKeyType,
  textContentType,
  autoComplete,
  blurOnSubmit,
  maxLength
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "next" | "go" | "send";
  textContentType?: "emailAddress" | "password" | "username" | "none";
  autoComplete?: "email" | "password" | "username" | "off";
  blurOnSubmit?: boolean;
  maxLength?: number;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, typography.label]}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        textContentType={textContentType}
        autoComplete={autoComplete}
        blurOnSubmit={blurOnSubmit}
        maxLength={maxLength}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.s2
  },
  label: {
    marginBottom: spacing.s1
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: radius.rBtn,
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.s2 - 2,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
    fontFamily: typography.body.fontFamily
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface
  }
});

export default TextField;
