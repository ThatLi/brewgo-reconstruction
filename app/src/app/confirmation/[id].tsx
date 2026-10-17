import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { formatCny } from "@/domain/money";
import { useCart } from "@/state/cart-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function ConfirmationScreen() {
  const { lastConfirmation } = useCart();
  if (!lastConfirmation) {
    return (
      <Screen>
        <StateView
          actionLabel="Return to Order"
          body="The local confirmation is no longer available."
          onAction={() => router.replace("/(tabs)/order")}
          title="Confirmation not found"
          tone="error"
        />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <StateView
        body="Your mock order was confirmed locally. No payment was processed."
        title="Demo order confirmed"
        tone="success"
      />
      <View style={styles.card}>
        <Text style={styles.label}>Confirmation</Text>
        <Text selectable style={styles.id}>
          {lastConfirmation.id}
        </Text>
        <Text style={styles.detail}>{lastConfirmation.storeName}</Text>
        <Text style={styles.detail}>
          {lastConfirmation.fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}
        </Text>
        <Text style={styles.total}>{formatCny(lastConfirmation.totalFen)}</Text>
      </View>
      <ActionButton label="Continue ordering" onPress={() => router.replace("/(tabs)/order")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  detail: { ...typography.body, color: colors.muted },
  id: { ...typography.section, color: colors.ink },
  label: { ...typography.caption, color: colors.muted },
  screen: { gap: spacing.lg },
  total: { ...typography.title, color: colors.emberDark },
});
