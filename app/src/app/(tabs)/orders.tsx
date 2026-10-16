import { Text } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { colors, spacing, typography } from "@/theme/tokens";

export default function OrdersScreen() {
  return (
    <Screen contentStyle={{ gap: spacing.lg }}>
      <AppHeader />
      <Text accessibilityRole="header" style={{ ...typography.title, color: colors.ink }}>
        Demo orders
      </Text>
      <StateView
        body="Locally confirmed demo orders will appear here."
        title="No orders yet"
        tone="empty"
      />
    </Screen>
  );
}
