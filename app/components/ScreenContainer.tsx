import React from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../theme/tokens";
import MessageBannerStack from "../messages/MessageBannerStack";

const ScreenContainer = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { width } = useWindowDimensions();
  const maxWidth = 920;
  const contentStyle = width > maxWidth ? { width: maxWidth, alignSelf: "center" as const } : null;

  return (
    <SafeAreaView style={[styles.container, style]}>
      <LinearGradient
        colors={[colors.bg, colors.bgElev]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.blob, styles.blobIndigo]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobTeal]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobAmber]} />
      <View style={[styles.content, contentStyle]}>
        <MessageBannerStack />
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.s3,
    paddingTop: spacing.s2
  },
  blob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.18
  },
  blobIndigo: {
    backgroundColor: colors.indigoTint,
    top: -80,
    left: -80
  },
  blobTeal: {
    backgroundColor: colors.primaryTint,
    bottom: -120,
    right: -60
  },
  blobAmber: {
    backgroundColor: colors.amberTint,
    top: 120,
    right: -140
  }
});

export default ScreenContainer;
