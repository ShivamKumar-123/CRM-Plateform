import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import ScreenHeader from "../components/ScreenHeader";
import { API_URL } from "../config";
import { colors, radius } from "../theme";

const PLAN_TINT = {
  FREE: colors.textDim,
  PRO: colors.sky,
  ENTERPRISE: colors.yellow,
};

const STATUS_TINT = {
  ACTIVE:    colors.green,
  TRIAL:     colors.sky,
  SUSPENDED: colors.red,
  CANCELLED: colors.textFaint,
};

export default function ProfileScreen() {
  const { username, organization, role, isSuperUser, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Profile" subtitle="Account & settings" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User card */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(username || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{username || "Unknown"}</Text>
              {isSuperUser && (
                <View style={[styles.chip, { backgroundColor: colors.yellow }]}>
                  <Ionicons name="ribbon" size={10} color="#000" />
                  <Text style={[styles.chipText, { color: "#000" }]}>SUPER</Text>
                </View>
              )}
            </View>
            <Text style={styles.muted}>
              {role ? `Role: ${role}` : "Signed in"}
            </Text>
          </View>
        </View>

        {/* Organization card */}
        {organization && (
          <View style={styles.card}>
            <View
              style={[
                styles.orgIcon,
                { backgroundColor: organization.primary_color || colors.yellow },
              ]}
            >
              <Ionicons name="business" size={20} color="#000" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.label}>Organization</Text>
              <Text style={styles.name} numberOfLines={1}>
                {organization.name}
              </Text>
              <View style={styles.orgMeta}>
                <View style={[styles.chip, { backgroundColor: PLAN_TINT[organization.plan] + "33" }]}>
                  <Text style={[styles.chipText, { color: PLAN_TINT[organization.plan] }]}>
                    {organization.plan}
                  </Text>
                </View>
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: STATUS_TINT[organization.status] + "33" },
                  ]}
                >
                  <Text
                    style={[styles.chipText, { color: STATUS_TINT[organization.status] }]}
                  >
                    {organization.status}
                  </Text>
                </View>
                <Text style={styles.muted}>
                  · {organization.industry}
                </Text>
              </View>
              <Text style={styles.slugLine}>
                /{organization.slug}
              </Text>
            </View>
          </View>
        )}

        {/* System info card */}
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
          <Ionicons name="log-out-outline" size={18} color="#fca5a5" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  orgIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  muted: { color: colors.textDim, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  label: { color: colors.textFaint, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  orgMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  slugLine: {
    color: colors.textFaint,
    fontSize: 11,
    fontFamily: "monospace",
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
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
