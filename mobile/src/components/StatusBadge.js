import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../theme";

const PALETTE = {
  NEW: { bg: colors.sky, fg: "#000" },
  CONTACTED: { bg: colors.sky, fg: "#000" },
  SITE_VISIT: { bg: colors.yellow, fg: "#000" },
  QUOTATION_SENT: { bg: colors.yellow, fg: "#000" },
  DEALED: { bg: colors.green, fg: "#000" },
  CANCELLED: { bg: colors.red, fg: "#fff" },
  OPEN: { bg: colors.sky, fg: "#000" },
  WON: { bg: colors.green, fg: "#000" },
};

export default function StatusBadge({ status }) {
  const key = String(status || "").toUpperCase();
  const palette = PALETTE[key] || { bg: "#6b7280", fg: "#fff" };
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.fg }]}>{status || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  text: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
});
