import { Text } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { colors, spacing, typography } from "@/theme/tokens";

export default function CartScreen() {
  return (
    <Screen contentStyle={{ gap: spacing.lg }}>
      <AppHeader />
      <Text accessibilityRole="header" style={{ ...typography.title, color: colors.ink }}>
        Your cart
      </Text>
      <StateView
        body="Browse the menu and customize something delicious."
        title="Your next favorite is waiting."
        tone="empty"
      />
    </Screen>
  );
}
