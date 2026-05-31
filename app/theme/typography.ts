import { colors } from "./tokens";

export const fontFamilies = {
  regular: "Sora_400Regular",
  semibold: "Sora_600SemiBold",
  bold: "Sora_700Bold"
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    color: colors.text,
    fontFamily: fontFamilies.bold
  },
  h2: {
    fontSize: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
    color: colors.text,
    fontFamily: fontFamilies.semibold
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    color: colors.text,
    fontFamily: fontFamilies.regular
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: colors.muted,
    fontFamily: fontFamilies.regular
  },
  label: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: colors.muted,
    fontFamily: fontFamilies.semibold
  }
};
