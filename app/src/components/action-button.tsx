import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing, typography } from "@/theme/tokens";

interface ActionButtonProps extends Omit<ComponentProps<typeof Pressable>, "children" | "style"> {
  label: string;
  tone?: "primary" | "secondary";
}

export function ActionButton({ disabled, label, tone = "primary", ...props }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        tone === "primary" ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...props}
    >
      <Text style={tone === "primary" ? styles.primaryLabel : styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.control,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
  },
  primary: {
    backgroundColor: colors.ember,
  },
  primaryLabel: {
    ...typography.label,
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.cream,
    borderColor: colors.sand,
    borderWidth: 1,
  },
  secondaryLabel: {
    ...typography.label,
    color: colors.ink,
  },
});
