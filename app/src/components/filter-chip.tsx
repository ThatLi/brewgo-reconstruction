import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing, typography } from "@/theme/tokens";

interface FilterChipProps {
  label: string;
  onPress(): void;
  selected: boolean;
}

export function FilterChip({ label, onPress, selected }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.base, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderColor: colors.sand,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.ink,
  },
  selected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  selectedLabel: {
    color: colors.white,
  },
});
