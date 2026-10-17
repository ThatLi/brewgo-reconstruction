import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/theme/tokens";

interface AppHeaderProps {
  modeLabel?: string;
  onStorePress?: () => void;
  storeLabel?: string;
}

export function AppHeader({
  modeLabel = "Pickup",
  onStorePress,
  storeLabel = "Choose a store",
}: AppHeaderProps) {
  return (
    <View accessibilityRole="header" style={styles.container}>
      <View>
        <Text style={styles.wordmark}>BrewGo</Text>
        <Text style={styles.tagline}>Good coffee, already on its way.</Text>
      </View>
      <Pressable
        accessibilityLabel={`Current store: ${storeLabel}. Fulfillment: ${modeLabel}.`}
        accessibilityRole="button"
        disabled={!onStorePress}
        onPress={onStorePress}
        style={styles.storeChip}
      >
        <Text numberOfLines={1} style={styles.storeName}>
          {storeLabel}
        </Text>
        <Text style={styles.mode}>{modeLabel}</Text>
        <Text style={styles.changeLabel}>Change</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  changeLabel: {
    ...typography.caption,
    color: colors.emberDark,
    fontWeight: "700",
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
