import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme/tokens";

interface ScreenProps extends PropsWithChildren {
  contentStyle?: ViewStyle;
  scroll?: boolean;
}

export function Screen({ children, contentStyle, scroll = true }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safe, styles.content, contentStyle]}>{children}</SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  safe: {
    backgroundColor: colors.paper,
    flex: 1,
  },
});
