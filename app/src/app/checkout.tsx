import { useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { Screen } from "@/components/screen";
import { products } from "@/data/fixtures";
import { formatCny } from "@/domain/money";
import { useCart } from "@/state/cart-provider";
import { useCatalog } from "@/state/catalog-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

const demoAddress = "9 Demo Lane, Level 2";

export default function CheckoutScreen() {
  const { confirmCheckout, lines, selectedCoupon, totals } = useCart();
  const { fulfillmentMode, selectedStore } = useCatalog();
  const [addressSelected, setAddressSelected] = useState(false);
  const [validation, setValidation] = useState<string>();

  async function confirm() {
    const result = await confirmCheckout(addressSelected ? demoAddress : undefined);
    if (!result.ok) {
      setValidation(result.error);
      return;
    }
    router.replace(`/confirmation/${result.id}`);
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>
          Review checkout
        </Text>
        <ActionButton label="Back" onPress={() => router.back()} tone="secondary" />
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{selectedStore?.name ?? "No store selected"}</Text>
        <Text style={styles.detail}>{fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}</Text>
        {fulfillmentMode === "delivery" ? (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: addressSelected }}
            onPress={() => {
              setAddressSelected((value) => !value);
              setValidation(undefined);
            }}
            style={[styles.address, addressSelected && styles.addressSelected]}
          >
            <Text style={styles.sectionTitle}>Use synthetic address</Text>
            <Text style={styles.detail}>{demoAddress}</Text>
          </Pressable>
        ) : (
          <Text style={styles.detail}>{selectedStore?.address}</Text>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {lines.map((line) => (
          <View key={line.id} style={styles.row}>
            <Text style={styles.detail}>
              {line.quantity} × {products.find(({ id }) => id === line.productId)?.name}
            </Text>
            <Text style={styles.value}>{formatCny(line.lineTotalFen)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Summary label="Subtotal" value={formatCny(totals.subtotalFen)} />
        <Summary label="Coupon" value={selectedCoupon?.code ?? "None"} />
        <Summary label="Discount" value={`−${formatCny(totals.discountFen)}`} />
        <Summary label="Demo total" value={formatCny(totals.totalFen)} strong />
      </View>
      <Text style={styles.notice}>
        No payment is collected. Confirmation creates local demo data only.
      </Text>
      {validation ? (
        <Text accessibilityLiveRegion="assertive" style={styles.validation}>
          {validation}
        </Text>
      ) : null}
      <ActionButton
        label={`Confirm demo · ${formatCny(totals.totalFen)}`}
        onPress={() => void confirm()}
      />
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
  address: {
    borderColor: colors.sand,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.sm,
    minHeight: 64,
    padding: spacing.md,
  },
  addressSelected: { backgroundColor: colors.sky, borderColor: colors.teal, borderWidth: 2 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    gap: spacing.md,
    padding: spacing.lg,
  },
  detail: { ...typography.body, color: colors.muted, flex: 1 },
  notice: { ...typography.caption, color: colors.muted },
  row: { flexDirection: "row", gap: spacing.md, justifyContent: "space-between" },
  screen: { gap: spacing.lg },
  sectionTitle: { ...typography.section, color: colors.ink },
  title: { ...typography.title, color: colors.ink, flex: 1 },
  titleRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.md },
  validation: { ...typography.body, color: colors.danger },
  value: { ...typography.label, color: colors.ink },
});
