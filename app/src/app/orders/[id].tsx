import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { formatCny } from "@/domain/money";
import { getFulfillmentStatus } from "@/domain/order";
import { useCart } from "@/state/cart-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useCart();
  const order = orders.find((item) => item.id === id);

  if (!order) {
    return (
      <Screen>
        <StateView
          actionLabel="Back to orders"
          body="This local demo order is unavailable."
          onAction={() => router.replace("/(tabs)/orders")}
          title="Order not found"
          tone="error"
        />
      </Screen>
    );
  }

  const status = getFulfillmentStatus(order, new Date().toISOString());
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text accessibilityRole="header" style={styles.title}>
            {order.id}
          </Text>
          <Text style={styles.status}>{status}</Text>
        </View>
        <ActionButton label="Back" onPress={() => router.back()} tone="secondary" />
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{order.storeName}</Text>
        <Text style={styles.detail}>
          {order.fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}
        </Text>
        {order.deliveryAddress ? <Text style={styles.detail}>{order.deliveryAddress}</Text> : null}
        <Text style={styles.detail}>{new Date(order.createdAt).toLocaleString()}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.lines.map((line) => (
          <View key={line.cartLineId} style={styles.line}>
            <View style={styles.row}>
              <Text style={styles.itemName}>
                {line.quantity} × {line.productName}
              </Text>
              <Text style={styles.value}>{formatCny(line.lineTotalFen)}</Text>
            </View>
            {line.optionNames.length ? (
              <Text style={styles.options}>{line.optionNames.join(" · ")}</Text>
            ) : null}
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Summary label="Subtotal" value={formatCny(order.subtotalFen)} />
        <Summary label="Discount" value={`−${formatCny(order.discountFen)}`} />
        <Summary label="Total" value={formatCny(order.totalFen)} strong />
      </View>
      <Text style={styles.notice}>
        Status is generated from local demo time and is not live tracking.
      </Text>
    </Screen>
  );
}

function Summary({
  label,
  strong = false,
  value,
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={strong ? styles.sectionTitle : styles.detail}>{label}</Text>
      <Text style={strong ? styles.sectionTitle : styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    gap: spacing.md,
    padding: spacing.lg,
  },
  detail: { ...typography.body, color: colors.muted },
  itemName: { ...typography.body, color: colors.ink, flex: 1 },
  line: { gap: spacing.xs },
  notice: { ...typography.caption, color: colors.muted },
  options: { ...typography.caption, color: colors.muted },
  row: { flexDirection: "row", gap: spacing.md, justifyContent: "space-between" },
  screen: { gap: spacing.lg },
  sectionTitle: { ...typography.section, color: colors.ink },
  status: { ...typography.label, color: colors.teal, textTransform: "capitalize" },
  title: { ...typography.title, color: colors.ink },
  titleCopy: { flex: 1, gap: spacing.xs },
  titleRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.md },
  value: { ...typography.label, color: colors.ink },
});
