import { useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { FilterChip } from "@/components/filter-chip";
import { Screen } from "@/components/screen";
import type { FulfillmentMode, StoreId } from "@/domain/types";
import { useCatalog } from "@/state/catalog-provider";
import { cardShadow, colors, radii, spacing, typography } from "@/theme/tokens";

export default function StoresScreen() {
  const { fulfillmentMode, selectStore, selectedStore, stores } = useCatalog();
  const [storeId, setStoreId] = useState<StoreId | undefined>(selectedStore?.id);
  const [mode, setMode] = useState<FulfillmentMode>(fulfillmentMode);
  const store = stores.find(({ id }) => id === storeId);
  const modeSupported = store?.supportedModes.includes(mode) ?? false;

  function chooseStore(id: StoreId) {
    const nextStore = stores.find((item) => item.id === id);
    setStoreId(id);
    if (nextStore && !nextStore.supportedModes.includes(mode)) {
      setMode(nextStore.supportedModes[0] ?? "pickup");
    }
  }

  function save() {
    if (!store || !modeSupported || store.availability === "unavailable") return;
    selectStore(store.id, mode);
    router.back();
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text accessibilityRole="header" style={styles.title}>
            Choose a store
          </Text>
          <Text style={styles.subtitle}>All locations and addresses are synthetic demo data.</Text>
        </View>
        <ActionButton label="Close" onPress={() => router.back()} tone="secondary" />
      </View>
      <View accessibilityRole="radiogroup" style={styles.list}>
        {stores.map((item) => {
          const selected = item.id === storeId;
          return (
            <Pressable
              accessibilityLabel={`${item.name}, ${item.distanceLabel}, ${item.openingHours}`}
              accessibilityRole="radio"
              accessibilityState={{
                checked: selected,
                disabled: item.availability === "unavailable",
              }}
              disabled={item.availability === "unavailable"}
              key={item.id}
              onPress={() => chooseStore(item.id)}
              style={[styles.card, selected && styles.selectedCard]}
            >
              <View style={styles.cardHeading}>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.distance}>{item.distanceLabel}</Text>
              </View>
              <Text style={styles.detail}>{item.address}</Text>
              <Text style={styles.detail}>{item.openingHours}</Text>
              <Text style={styles.modes}>
                {item.supportedModes
                  .map((value) => (value === "pickup" ? "Pickup" : "Delivery"))
                  .join(" · ")}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {store ? (
        <View style={styles.modeSection}>
          <Text style={styles.sectionTitle}>Fulfillment</Text>
          <View style={styles.modeRow}>
            <FilterChip
              label="Pickup"
              onPress={() => setMode("pickup")}
              selected={mode === "pickup"}
            />
            {store.supportedModes.includes("delivery") ? (
              <FilterChip
                label="Delivery"
                onPress={() => setMode("delivery")}
                selected={mode === "delivery"}
              />
            ) : null}
          </View>
        </View>
      ) : null}
      <ActionButton disabled={!store || !modeSupported} label="Use this store" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardShadow,
    backgroundColor: colors.white,
    borderColor: colors.sand,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 132,
    padding: spacing.lg,
  },
  cardHeading: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  detail: {
    ...typography.body,
    color: colors.muted,
  },
  distance: {
    ...typography.label,
    color: colors.teal,
  },
  list: {
    gap: spacing.md,
  },
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modes: {
    ...typography.caption,
    color: colors.emberDark,
  },
  modeSection: {
    gap: spacing.sm,
  },
  screen: {
    gap: spacing.xl,
  },
  sectionTitle: {
    ...typography.section,
    color: colors.ink,
  },
  selectedCard: {
    borderColor: colors.ember,
    borderWidth: 2,
  },
  storeName: {
    ...typography.section,
    color: colors.ink,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  title: {
    ...typography.title,
    color: colors.ink,
  },
  titleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
});
