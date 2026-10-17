import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { formatCny } from "@/domain/money";
import { getFulfillmentStatus } from "@/domain/order";
import { useCart } from "@/state/cart-provider";
import { useCatalog } from "@/state/catalog-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function OrdersScreen() {
  const { orders, storageError, storageStatus } = useCart();
  const { fulfillmentMode, selectedStore } = useCatalog();

  return (
    <Screen contentStyle={styles.screen}>
      <AppHeader
        modeLabel={fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}
        onStorePress={() => router.push("/stores")}
        storeLabel={selectedStore?.name}
      />
      <Text accessibilityRole="header" style={styles.title}>
        Demo orders
      </Text>
      {storageStatus === "loading" ? (
        <StateView body="Restoring local order history." title="Loading orders" tone="loading" />
      ) : storageStatus === "error" ? (
        <StateView
          body={storageError ?? "Local order history could not be opened."}
          title="Orders unavailable"
          tone="error"
        />
      ) : !orders.length ? (
        <StateView
          body="Locally confirmed demo orders will appear here."
          title="No orders yet"
          tone="empty"
        />
      ) : (
        <View style={styles.list}>
          {orders.map((order) => {
            const status = getFulfillmentStatus(order, new Date().toISOString());
            return (
              <Pressable
                accessibilityLabel={`Order ${order.id}, ${status}, ${formatCny(order.totalFen)}`}
                accessibilityRole="button"
                key={order.id}
                onPress={() => router.push(`/orders/${order.id}`)}
                style={styles.card}
              >
                <View style={styles.row}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.total}>{formatCny(order.totalFen)}</Text>
                </View>
                <Text style={styles.detail}>{order.storeName}</Text>
                <Text style={styles.detail}>
                  {order.fulfillmentMode === "pickup" ? "Pickup" : "Delivery"} · {status}
                </Text>
                <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.cream,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 116,
    padding: spacing.lg,
  },
  date: { ...typography.caption, color: colors.muted },
  detail: { ...typography.body, color: colors.muted, textTransform: "capitalize" },
  list: { gap: spacing.md },
  orderId: { ...typography.section, color: colors.ink },
  row: { flexDirection: "row", gap: spacing.md, justifyContent: "space-between" },
  screen: { gap: spacing.lg },
  title: { ...typography.title, color: colors.ink },
  total: { ...typography.label, color: colors.emberDark },
});
