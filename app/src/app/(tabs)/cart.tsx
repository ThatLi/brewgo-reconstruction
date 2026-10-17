import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { modifierOptions, products } from "@/data/fixtures";
import { formatCny } from "@/domain/money";
import { useCart } from "@/state/cart-provider";
import { useCatalog } from "@/state/catalog-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function CartScreen() {
  const { lines, removeLine, totals, updateQuantity } = useCart();
  const { fulfillmentMode, selectedStore } = useCatalog();

  return (
    <Screen contentStyle={styles.screen}>
      <AppHeader
        modeLabel={fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}
        onStorePress={() => router.push("/stores")}
        storeLabel={selectedStore?.name}
      />
      <Text accessibilityRole="header" style={styles.title}>
        Your cart
      </Text>
      {!lines.length ? (
        <StateView
          actionLabel="Browse drinks"
          body="Browse the menu and customize something delicious."
          onAction={() => router.navigate("/(tabs)/order")}
          title="Your next favorite is waiting."
          tone="empty"
        />
      ) : (
        <>
          <View style={styles.lines}>
            {lines.map((line) => {
              const product = products.find(({ id }) => id === line.productId);
              const optionNames = modifierOptions
                .filter(({ id }) => line.selectedOptionIds.includes(id))
                .map(({ name }) => name);
              return (
                <View key={line.id} style={styles.line}>
                  <View style={styles.lineHeading}>
                    <Text style={styles.lineName}>{product?.name ?? "Unknown product"}</Text>
                    <Text style={styles.linePrice}>{formatCny(line.lineTotalFen)}</Text>
                  </View>
                  {optionNames.length ? (
                    <Text style={styles.options}>{optionNames.join(" · ")}</Text>
                  ) : null}
                  <View style={styles.actions}>
                    <ActionButton
                      label="−"
                      onPress={() => updateQuantity(line.id, line.quantity - 1)}
                      tone="secondary"
                    />
                    <Text accessibilityLiveRegion="polite" style={styles.quantity}>
                      {line.quantity}
                    </Text>
                    <ActionButton
                      disabled={line.quantity >= (product?.maxQuantity ?? 1)}
                      label="+"
                      onPress={() => updateQuantity(line.id, line.quantity + 1)}
                      tone="secondary"
                    />
                    <ActionButton
                      label="Remove"
                      onPress={() => removeLine(line.id)}
                      tone="secondary"
                    />
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{totals.itemCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.total}>{formatCny(totals.subtotalFen)}</Text>
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  line: {
    backgroundColor: colors.white,
    borderColor: colors.cream,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  lineHeading: { flexDirection: "row", gap: spacing.md, justifyContent: "space-between" },
  lineName: { ...typography.section, color: colors.ink, flex: 1 },
  linePrice: { ...typography.label, color: colors.emberDark },
  lines: { gap: spacing.md },
  options: { ...typography.caption, color: colors.muted },
  quantity: { ...typography.section, color: colors.ink, minWidth: 32, textAlign: "center" },
  screen: { gap: spacing.lg },
  summary: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  summaryLabel: { ...typography.body, color: colors.muted },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryValue: { ...typography.label, color: colors.ink },
  title: { ...typography.title, color: colors.ink },
  total: { ...typography.section, color: colors.ink },
});
