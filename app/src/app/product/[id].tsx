import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { modifierGroups, modifierOptions } from "@/data/fixtures";
import { formatCny } from "@/domain/money";
import { useCatalog } from "@/state/catalog-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, selectedStore } = useCatalog();
  const product = products.find((item) => item.id === id);

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

  const groups = modifierGroups.filter((group) => product.modifierGroupIds.includes(group.id));

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
      <View style={styles.storeNote}>
        <Text style={styles.noteTitle}>
          Browsing at {selectedStore?.name ?? "no selected store"}
        </Text>
        <Text style={styles.noteBody}>
          Customization and cart actions are added in the next increment.
        </Text>
      </View>
      {groups.map((group) => (
        <View key={group.id} style={styles.group}>
          <View style={styles.groupHeading}>
            <Text style={styles.groupTitle}>{group.name}</Text>
            <Text style={styles.requirement}>
              {group.minSelections ? "Required" : "Optional"} · choose up to {group.maxSelections}
            </Text>
          </View>
          <View style={styles.optionList}>
            {modifierOptions
              .filter((option) => group.optionIds.includes(option.id))
              .map((option) => (
                <Text key={option.id} style={styles.option}>
                  {option.name}
                  {option.priceDeltaFen ? ` +${formatCny(option.priceDeltaFen)}` : ""}
                </Text>
              ))}
          </View>
        </View>
      ))}
      {product.availability === "unavailable" ? (
        <StateView
          body={product.unavailableReason ?? "Choose another original demo item."}
          title="Currently unavailable"
          tone="unavailable"
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: {
    ...typography.body,
    color: colors.muted,
  },
  group: {
    backgroundColor: colors.white,
    borderColor: colors.cream,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  groupHeading: {
    gap: spacing.xs,
  },
  groupTitle: {
    ...typography.section,
    color: colors.ink,
  },
  noteBody: {
    ...typography.body,
    color: colors.muted,
  },
  noteTitle: {
    ...typography.label,
    color: colors.ink,
  },
  option: {
    ...typography.body,
    color: colors.ink,
  },
  optionList: {
    gap: spacing.sm,
  },
  price: {
    ...typography.title,
    color: colors.emberDark,
  },
  requirement: {
    ...typography.caption,
    color: colors.teal,
  },
  screen: {
    gap: spacing.lg,
  },
  storeNote: {
    backgroundColor: colors.cream,
    borderRadius: radii.control,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.ink,
    flex: 1,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
});
