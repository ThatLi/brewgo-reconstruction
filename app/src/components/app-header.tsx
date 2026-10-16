import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/theme/tokens";

interface AppHeaderProps {
  modeLabel?: string;
  storeLabel?: string;
}

export function AppHeader({ modeLabel = "Pickup", storeLabel = "Choose a store" }: AppHeaderProps) {
  return (
    <View accessibilityRole="header" style={styles.container}>
      <View>
        <Text style={styles.wordmark}>BrewGo</Text>
        <Text style={styles.tagline}>Good coffee, already on its way.</Text>
      </View>
      <View
        accessibilityLabel={`Current store: ${storeLabel}. Fulfillment: ${modeLabel}.`}
        style={styles.storeChip}
      >
        <Text numberOfLines={1} style={styles.storeName}>
          {storeLabel}
        </Text>
        <Text style={styles.mode}>{modeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  mode: {
    ...typography.caption,
    color: colors.teal,
  },
  storeChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.cream,
    borderColor: colors.sand,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.xs,
    maxWidth: "100%",
    minHeight: 44,
    minWidth: 180,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  storeName: {
    ...typography.label,
    color: colors.ink,
  },
  tagline: {
    ...typography.caption,
    color: colors.muted,
  },
  wordmark: {
    ...typography.title,
    color: colors.ink,
  },
});
