import { StyleSheet, Text, View } from "react-native";

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        BrewGo
      </Text>
      <Text style={styles.body}>The clean-room demo scaffold is ready.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: "#667277",
    fontSize: 16,
    lineHeight: 24,
  },
  container: {
    alignItems: "center",
    backgroundColor: "#FFFDF8",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#1D2528",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 38,
  },
});
