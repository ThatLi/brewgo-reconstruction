import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatCny } from "@/domain/money";
import type { Product } from "@/domain/types";
import { cardShadow, colors, radii, spacing, typography } from "@/theme/tokens";

interface ProductCardProps {
  onPress(): void;
  product: Product;
}

export function ProductCard({ onPress, product }: ProductCardProps) {
  const unavailable = product.availability === "unavailable";
  return (
    <Pressable
      accessibilityHint="Opens product details"
      accessibilityLabel={`${product.name}, ${formatCny(product.basePriceFen)}${unavailable ? ", unavailable" : ""}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <Text style={styles.name}>{product.name}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {product.description}
        </Text>
        {unavailable ? <Text style={styles.unavailable}>Unavailable</Text> : null}
      </View>
      <Text style={styles.price}>{formatCny(product.basePriceFen)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardShadow,
    backgroundColor: colors.white,
    borderColor: colors.cream,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
    minHeight: 124,
    padding: spacing.lg,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.muted,
  },
  name: {
    ...typography.section,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.78,
  },
  price: {
    ...typography.label,
    color: colors.emberDark,
  },
  unavailable: {
    ...typography.label,
    color: colors.danger,
  },
});
