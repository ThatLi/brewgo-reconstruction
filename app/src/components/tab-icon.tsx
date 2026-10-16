import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";

import { colors } from "@/theme/tokens";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

interface TabIconProps {
  color: unknown;
  focused: boolean;
  name: IconName;
  size: number;
}

export function TabIcon({ color, focused, name, size }: TabIconProps) {
  return (
    <MaterialCommunityIcons
      color={typeof color === "string" ? color : colors.muted}
      name={focused ? name : (`${name}-outline` as IconName)}
      size={size}
    />
  );
}
