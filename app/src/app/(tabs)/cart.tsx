import { useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { modifierOptions, products } from "@/data/fixtures";
import { couponRejectionCopy } from "@/domain/coupon";
import { formatCny } from "@/domain/money";
import type { CouponRejection } from "@/domain/types";
import { useCart } from "@/state/cart-provider";
import { useCatalog } from "@/state/catalog-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function CartScreen() {
  const {
    applyCoupon,
    availableCoupons,
    couponEvaluation,
    lines,
    recoveryNotice,
    removeLine,
    selectedCoupon,
    storageError,
    storageStatus,
    totals,
    updateQuantity,
  } = useCart();
  const { fulfillmentMode, selectedStore } = useCatalog();
  const [couponCode, setCouponCode] = useState("");
  const [couponRejection, setCouponRejection] = useState<CouponRejection>();

  function submitCoupon(code: string) {
    setCouponCode(code);
    setCouponRejection(applyCoupon(code));
  }

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
      {recoveryNotice ? (
        <Text accessibilityLiveRegion="polite" style={styles.recoveryNotice}>
          {recoveryNotice}
        </Text>
      ) : null}
      {storageStatus === "loading" ? (
        <StateView body="Restoring your local cart." title="Loading cart" tone="loading" />
      ) : storageStatus === "error" ? (
        <StateView
          body={storageError ?? "Local cart storage could not be opened."}
          title="Cart unavailable"
          tone="error"
        />
      ) : !lines.length ? (
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
                      label="Decrease quantity"
                      onPress={() => updateQuantity(line.id, line.quantity - 1)}
                      tone="secondary"
                    />
                    <Text accessibilityLiveRegion="polite" style={styles.quantity}>
                      {line.quantity}
                    </Text>
                    <ActionButton
                      disabled={line.quantity >= (product?.maxQuantity ?? 1)}
                      label="Increase quantity"
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
            <SummaryRow label="Items" value={`${totals.itemCount}`} />
            <SummaryRow label="Subtotal" value={formatCny(totals.subtotalFen)} />
            <SummaryRow label="Discount" value={`−${formatCny(totals.discountFen)}`} />
            <SummaryRow label="Total" value={formatCny(totals.totalFen)} strong />
          </View>
          <View style={styles.couponSection}>
            <Text style={styles.sectionTitle}>Demo coupon</Text>
            <View style={styles.couponForm}>
              <TextInput
                accessibilityLabel="Coupon code"
                autoCapitalize="characters"
                onChangeText={setCouponCode}
                placeholder="Enter code"
                placeholderTextColor={colors.muted}
                style={styles.couponInput}
                value={couponCode}
              />
              <ActionButton
                label="Apply"
                onPress={() => submitCoupon(couponCode)}
                tone="secondary"
              />
            </View>
            <View style={styles.couponChoices}>
              {availableCoupons.map((coupon) => (
                <Pressable
                  accessibilityRole="button"
                  key={coupon.id}
                  onPress={() => submitCoupon(coupon.code)}
                  style={styles.couponChoice}
                >
                  <Text style={styles.couponCode}>{coupon.code}</Text>
                  <Text style={styles.couponDescription}>{coupon.description}</Text>
                </Pressable>
              ))}
            </View>
            {selectedCoupon ? (
              <Text style={styles.applied}>Selected: {selectedCoupon.name}</Text>
            ) : null}
            {couponRejection || couponEvaluation?.rejection ? (
              <Text accessibilityLiveRegion="polite" style={styles.validation}>
                {couponRejectionCopy[(couponRejection ?? couponEvaluation?.rejection)!]}
              </Text>
            ) : couponEvaluation?.eligible ? (
              <Text accessibilityLiveRegion="polite" style={styles.applied}>
                Coupon applied. You save {formatCny(couponEvaluation.discountFen)}.
              </Text>
            ) : null}
          </View>
          <ActionButton label="Review checkout" onPress={() => router.push("/checkout")} />
        </>
      )}
    </Screen>
  );
}

function SummaryRow({
  label,
  strong = false,
  value,
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={strong ? styles.total : styles.summaryLabel}>{label}</Text>
      <Text style={strong ? styles.total : styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  applied: { ...typography.label, color: colors.teal },
  couponChoice: {
    borderColor: colors.sand,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 56,
    padding: spacing.md,
  },
  couponChoices: { gap: spacing.sm },
  couponCode: { ...typography.label, color: colors.ink },
  couponDescription: { ...typography.caption, color: colors.muted },
  couponForm: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  couponInput: {
    ...typography.body,
    borderColor: colors.sand,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  couponSection: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    gap: spacing.md,
    padding: spacing.lg,
  },
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
  recoveryNotice: {
    ...typography.body,
    backgroundColor: colors.sky,
    borderRadius: radii.control,
    color: colors.ink,
    padding: spacing.md,
  },
  screen: { gap: spacing.lg },
  sectionTitle: { ...typography.section, color: colors.ink },
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
  validation: { ...typography.body, color: colors.danger },
});
