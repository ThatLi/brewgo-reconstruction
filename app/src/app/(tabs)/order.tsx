import { Text } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { colors, spacing, typography } from "@/theme/tokens";

export default function OrderScreen() {
  return (
    <Screen contentStyle={{ gap: spacing.lg }}>
      <AppHeader />
      <Text accessibilityRole="header" style={{ ...typography.display, color: colors.ink }}>
        Find your next cup
      </Text>
      <StateView
        body="Choose a BrewGo café to see its original demo menu."
        title="Start with a store"
        tone="empty"
      />
    </Screen>
  );
}
