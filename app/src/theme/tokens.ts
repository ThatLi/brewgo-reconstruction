import { Platform, type ViewStyle } from "react-native";

export const colors = {
  cream: "#F5EFE3",
  danger: "#B83A3A",
  ember: "#E85D32",
  emberDark: "#B83F21",
  ink: "#1D2528",
  muted: "#667277",
  paper: "#FFFDF8",
  sand: "#D8C8AE",
  sky: "#DCEFF1",
  teal: "#167D73",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  control: 14,
  card: 18,
  pill: 999,
} as const;

export const typography = {
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  display: { fontSize: 32, lineHeight: 38, fontWeight: "700" as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "600" as const },
  section: { fontSize: 18, lineHeight: 24, fontWeight: "700" as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "700" as const },
} as const;

export const cardShadow: ViewStyle = Platform.select({
  android: { elevation: 2 },
  default: {
    shadowColor: colors.ink,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  web: { boxShadow: "0 3px 12px rgba(29, 37, 40, 0.08)" },
});
