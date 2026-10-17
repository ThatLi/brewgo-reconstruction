import { useMemo, useState } from "react";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { FilterChip } from "@/components/filter-chip";
import { ProductCard } from "@/components/product-card";
import { Screen } from "@/components/screen";
import { StateView } from "@/components/state-view";
import { filterProducts } from "@/domain/catalog";
import type { CategoryId } from "@/domain/types";
import { useCatalog } from "@/state/catalog-provider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function OrderScreen() {
  const { categories, fulfillmentMode, loadError, products, reload, selectedStore, status } =
    useCatalog();
  const [categoryId, setCategoryId] = useState<CategoryId>();
  const [query, setQuery] = useState("");
  const visibleProducts = useMemo(
    () => filterProducts(products, { categoryId, query }),
    [categoryId, products, query],
  );

  if (status === "loading") {
    return (
      <Screen>
        <StateView body="Preparing the local menu." title="Loading catalog" tone="loading" />
      </Screen>
    );
  }

  if (status === "error") {
    return (
      <Screen>
        <StateView
          actionLabel="Try again"
          body={loadError ?? "The local menu is temporarily unavailable."}
          onAction={() => void reload()}
          title="Catalog unavailable"
          tone="error"
        />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <AppHeader
        modeLabel={fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}
        onStorePress={() => router.push("/stores")}
        storeLabel={selectedStore?.name}
      />
      <Text accessibilityRole="header" style={styles.heading}>
        Find your next cup
      </Text>
      {!selectedStore ? (
        <StateView
          actionLabel="Choose a store"
          body="Select a BrewGo café and fulfillment mode to browse its original demo menu."
          onAction={() => router.push("/stores")}
          title="Start with a store"
          tone="empty"
        />
      ) : (
        <>
          <TextInput
            accessibilityLabel="Search products"
            onChangeText={setQuery}
            placeholder="Search drinks and bakery"
            placeholderTextColor={colors.muted}
            style={styles.search}
            value={query}
          />
          <ScrollView
            contentContainerStyle={styles.filters}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <FilterChip
              label="All"
              onPress={() => setCategoryId(undefined)}
              selected={!categoryId}
            />
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                label={category.name}
                onPress={() => setCategoryId(category.id)}
                selected={categoryId === category.id}
              />
            ))}
          </ScrollView>
          {visibleProducts.length ? (
            <View style={styles.products}>
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  onPress={() => router.push(`/product/${product.id}`)}
                  product={product}
                />
              ))}
            </View>
          ) : (
            <StateView
              actionLabel="Clear search"
              body={`No original demo products match “${query}”.`}
              onAction={() => {
                setQuery("");
                setCategoryId(undefined);
              }}
              title="Nothing found"
              tone="empty"
            />
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  heading: {
    ...typography.display,
    color: colors.ink,
  },
  products: {
    gap: spacing.md,
  },
  screen: {
    gap: spacing.lg,
  },
  search: {
    ...typography.body,
    backgroundColor: colors.white,
    borderColor: colors.sand,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.ink,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
});
