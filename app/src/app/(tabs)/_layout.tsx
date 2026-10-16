import { Tabs } from "expo-router";

import { TabIcon } from "@/components/tab-icon";
import { colors, typography } from "@/theme/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emberDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: typography.caption,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.sand,
          minHeight: 64,
          paddingBottom: 6,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="order"
        options={{
          tabBarAccessibilityLabel: "Order tab",
          tabBarIcon: (props) => <TabIcon {...props} name="coffee" />,
          title: "Order",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarAccessibilityLabel: "Cart tab",
          tabBarIcon: (props) => <TabIcon {...props} name="cart" />,
          title: "Cart",
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarAccessibilityLabel: "Orders tab",
          tabBarIcon: (props) => <TabIcon {...props} name="receipt-text" />,
          title: "Orders",
        }}
      />
    </Tabs>
  );
}
