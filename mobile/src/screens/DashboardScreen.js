import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius } from "../theme";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function DashboardScreen() {
  const { username } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const winRate =
    stats && stats.total_deals
      ? `${((stats.won_deals / stats.total_deals) * 100).toFixed(1)}%`
      : "0%";
  const openDeals = stats
    ? stats.total_deals - stats.won_deals - stats.cancelled_deals
    : 0;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Dashboard"
        subtitle={username ? `Welcome back, ${username}` : "Welcome back"}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.yellow}
          />
        }
      >
        {loading ? (
          <ActivityIndicator color={colors.yellow} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Failed to load: {error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              <StatCard
                icon="people-outline"
                label="Total Leads"
                value={stats?.total_leads ?? 0}
                tint={colors.yellow}
              />
              <StatCard
                icon="briefcase-outline"
                label="Total Deals"
                value={stats?.total_deals ?? 0}
                tint={colors.sky}
              />
              <StatCard
                icon="cash-outline"
                label="Revenue"
                value={formatINR(stats?.total_revenue)}
                tint={colors.green}
              />
              <StatCard
                icon="trending-up-outline"
                label="Win Rate"
                value={winRate}
                tint={colors.pink}
              />
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Deal Performance</Text>
              <View style={styles.panelRow}>
                <Metric label="Open" value={openDeals} color={colors.sky} />
                <Metric label="Won" value={stats?.won_deals ?? 0} color={colors.green} />
                <Metric
                  label="Cancelled"
                  value={stats?.cancelled_deals ?? 0}
                  color={colors.red}
                />
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Total Profit</Text>
              <Text style={styles.bigValue}>{formatINR(stats?.total_profit)}</Text>
              <Text style={styles.muted}>Across won deals</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, tint }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.cardValue}>{value}</Text>
        </View>
        <View style={[styles.iconBubble, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={20} color="#000" />
        </View>
      </View>
    </View>
  );
}

function Metric({ label, value, color }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    flexGrow: 1,
    flexBasis: "47%",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLabel: { color: colors.textDim, fontSize: 12 },
  cardValue: { color: colors.text, fontSize: 22, fontWeight: "700", marginTop: 4 },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
  },
  panelTitle: { color: colors.yellow, fontSize: 14, fontWeight: "700", marginBottom: 12 },
  panelRow: { flexDirection: "row", gap: 12 },
  metric: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radius.md,
    padding: 12,
    borderColor: colors.border,
    borderWidth: 1,
  },
  metricLabel: { color: colors.textDim, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
  metricValue: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  bigValue: { color: colors.text, fontSize: 28, fontWeight: "700" },
  muted: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.3)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
  },
  errorText: { color: "#fca5a5", fontSize: 13 },
});
