import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type StateTone = "loading" | "empty" | "error" | "unavailable" | "success";

interface StateViewProps {
  actionLabel?: string;
  body: string;
  onAction?: () => void;
  title: string;
  tone: StateTone;
}

export function StateView({ actionLabel, body, onAction, title, tone }: StateViewProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      {tone === "loading" ? <ActivityIndicator color={colors.ember} size="small" /> : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <ActionButton label={actionLabel} onPress={onAction} tone="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignSelf: "stretch",
    marginTop: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.muted,
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.cream,
    borderColor: colors.sand,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 220,
    padding: spacing.xl,
  },
  title: {
    ...typography.section,
    color: colors.ink,
    textAlign: "center",
  },
});
