import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import ScreenHeader from "../components/ScreenHeader";
import { API_URL } from "../config";
import { colors, radius } from "../theme";

export default function ProfileScreen() {
  const { username, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Profile" subtitle="Account & settings" />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(username || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{username || "Unknown"}</Text>
            <Text style={styles.muted}>Signed in</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="server-outline" size={18} color={colors.textDim} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>API server</Text>
              <Text style={styles.muted} numberOfLines={1}>
                {API_URL}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={confirmLogout}
          activeOpacity={0.8}
          style={styles.logout}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#000", fontSize: 18, fontWeight: "700" },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  muted: { color: colors.textDim, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  label: { color: colors.text, fontSize: 13 },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.3)",
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    marginTop: 4,
  },
  logoutText: { color: "#fca5a5", fontSize: 15, fontWeight: "700" },
});
