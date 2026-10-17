import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CatalogProvider } from "@/state/catalog-provider";
import { CartProvider } from "@/state/cart-provider";
import { colors } from "@/theme/tokens";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CatalogProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <View style={styles.app}>
            <Stack screenOptions={{ contentStyle: styles.app, headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="stores" options={{ presentation: "modal" }} />
              <Stack.Screen name="product/[id]" options={{ presentation: "modal" }} />
              <Stack.Screen name="checkout" />
              <Stack.Screen name="confirmation/[id]" />
              <Stack.Screen name="orders/[id]" />
            </Stack>
          </View>
        </CartProvider>
      </CatalogProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.paper,
    flex: 1,
  },
});
