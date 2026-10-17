import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { modifierGroups, modifierOptions } from "@/data/fixtures";
import { createCartLine, validateModifierSelections } from "@/domain/cart";
import { addFen, formatCny, fen } from "@/domain/money";
import type { ModifierGroupId, ModifierOptionId } from "@/domain/types";
import { useCart } from "@/state/cart-provider";
import { useCatalog } from "@/state/catalog-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type SelectionMap = Partial<Record<ModifierGroupId, readonly ModifierOptionId[]>>;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, selectedStore } = useCatalog();
  const { addLine } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<SelectionMap>({});
  const [validationMessage, setValidationMessage] = useState<string>();
  const [saving, setSaving] = useState(false);
  const product = products.find((item) => item.id === id);
  const groups = useMemo(
    () => modifierGroups.filter((group) => product?.modifierGroupIds.includes(group.id)),
    [product],
  );
  const selectedIds = useMemo(
    () => Object.values(selections).flatMap((value) => value ?? []),
    [selections],
  );
  const selectedOptions = modifierOptions.filter((option) => selectedIds.includes(option.id));

  if (!product) {
    return (
      <Screen>
        <StateView
          actionLabel="Back to menu"
          body="This product is not part of the current local demo catalog."
          onAction={() => router.back()}
          title="Product not found"
          tone="error"
        />
      </Screen>
    );
  }

  const activeProduct = product;

  const unitPriceFen = addFen(
    product.basePriceFen,
    ...selectedOptions.map(({ priceDeltaFen }) => priceDeltaFen),
  );
  const totalFen = fen(unitPriceFen * quantity);

  function select(groupId: ModifierGroupId, optionId: ModifierOptionId, maximum: number) {
    setValidationMessage(undefined);
    setSelections((current) => {
      const existing = current[groupId] ?? [];
      const next = existing.includes(optionId)
        ? existing.filter((value) => value !== optionId)
        : maximum === 1
          ? [optionId]
          : [...existing, optionId].slice(-maximum);
      return { ...current, [groupId]: next };
    });
  }

  async function addToCart() {
    const validation = validateModifierSelections(groups, modifierOptions, selectedIds);
    if (!validation.valid) {
      setValidationMessage(validation.message);
      return;
    }
    setSaving(true);
    try {
      const line = await createCartLine(
        activeProduct,
        selectedOptions,
        quantity,
        new Date().toISOString(),
      );
      addLine(line);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  const canAdd =
    product.availability === "available" && selectedStore?.availability === "available";

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.topRow}>
        <Text accessibilityRole="header" style={styles.title}>
          {product.name}
        </Text>
        <ActionButton label="Close" onPress={() => router.back()} tone="secondary" />
      </View>
      <Text style={styles.price}>{formatCny(product.basePriceFen)}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.storeLabel}>
        Customizing at {selectedStore?.name ?? "no selected store"}
      </Text>
      {groups.map((group) => (
        <View key={group.id} style={styles.group}>
          <View style={styles.groupHeading}>
            <Text style={styles.groupTitle}>{group.name}</Text>
            <Text style={styles.requirement}>
              {group.minSelections ? "Required" : "Optional"} · choose up to {group.maxSelections}
            </Text>
          </View>
          <View accessibilityRole="radiogroup" style={styles.optionList}>
            {modifierOptions
              .filter((option) => group.optionIds.includes(option.id))
              .map((option) => {
                const selected = selections[group.id]?.includes(option.id) ?? false;
                return (
                  <Pressable
                    accessibilityRole={group.maxSelections === 1 ? "radio" : "checkbox"}
                    accessibilityState={{
                      checked: selected,
                      disabled: option.availability === "unavailable",
                    }}
                    disabled={option.availability === "unavailable"}
                    key={option.id}
                    onPress={() => select(group.id, option.id, group.maxSelections)}
                    style={[styles.option, selected && styles.selectedOption]}
                  >
                    <Text style={styles.optionName}>{option.name}</Text>
                    <Text style={styles.optionPrice}>
                      {option.priceDeltaFen ? `+${formatCny(option.priceDeltaFen)}` : "Included"}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        </View>
      ))}
      <View style={styles.quantitySection}>
        <Text style={styles.groupTitle}>Quantity</Text>
        <View style={styles.quantityRow}>
          <ActionButton
            disabled={quantity <= 1}
            label="Decrease"
            onPress={() => setQuantity((value) => Math.max(1, value - 1))}
            tone="secondary"
          />
          <Text accessibilityLiveRegion="polite" style={styles.quantity}>
            {quantity}
          </Text>
          <ActionButton
            disabled={quantity >= product.maxQuantity}
            label="Increase"
            onPress={() => setQuantity((value) => Math.min(product.maxQuantity, value + 1))}
            tone="secondary"
          />
        </View>
      </View>
      {validationMessage ? (
        <Text accessibilityLiveRegion="assertive" style={styles.validation}>
          {validationMessage}
        </Text>
      ) : null}
      <ActionButton
        disabled={!canAdd || saving}
        label={saving ? "Adding…" : `Add ${quantity} · ${formatCny(totalFen)}`}
        onPress={() => void addToCart()}
      />
      {!canAdd ? (
        <Text style={styles.validation}>This item cannot be added from the current store.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: { ...typography.body, color: colors.muted },
  group: {
    backgroundColor: colors.white,
    borderColor: colors.cream,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  groupHeading: { gap: spacing.xs },
  groupTitle: { ...typography.section, color: colors.ink },
  option: {
    alignItems: "center",
    borderColor: colors.sand,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  optionList: { gap: spacing.sm },
  optionName: { ...typography.body, color: colors.ink },
  optionPrice: { ...typography.caption, color: colors.muted },
  price: { ...typography.title, color: colors.emberDark },
  quantity: { ...typography.title, color: colors.ink, minWidth: 40, textAlign: "center" },
  quantityRow: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  quantitySection: { gap: spacing.md },
  requirement: { ...typography.caption, color: colors.teal },
  screen: { gap: spacing.lg },
  selectedOption: { backgroundColor: colors.sky, borderColor: colors.teal, borderWidth: 2 },
  storeLabel: { ...typography.label, color: colors.teal },
  title: { ...typography.title, color: colors.ink, flex: 1 },
  topRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.md },
  validation: { ...typography.body, color: colors.danger },
});
