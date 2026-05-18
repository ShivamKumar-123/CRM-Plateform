import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/api";
import ScreenHeader from "../components/ScreenHeader";
import StatusBadge from "../components/StatusBadge";
import { colors, radius } from "../theme";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function DealsScreen() {
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await api.getDeals();
      setDeals(data?.deals || []);
      setStats(data?.stats || null);
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

  const filtered = useMemo(() => {
    if (!search) return deals;
    const q = search.toLowerCase();
    return deals.filter(
      (d) =>
        String(d.id) === search ||
        d.phone?.includes(search) ||
        d.name?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q)
    );
  }, [search, deals]);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Deals"
        subtitle={
          stats
            ? `${stats.total_deals} total · ${stats.open_deals} open · ${stats.won_deals} won`
            : null
        }
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textFaint} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search deals..."
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && !refreshing ? (
        <ActivityIndicator color={colors.yellow} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <DealCard deal={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.yellow}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {deals.length === 0 ? "No deals yet." : "No matching deals."}
            </Text>
          }
        />
      )}
    </View>
  );
}

function DealCard({ deal }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.name} numberOfLines={1}>
            {deal.name}
          </Text>
          <Text style={styles.muted}>
            {deal.phone}
            {deal.city ? ` · ${deal.city}` : ""}
          </Text>
        </View>
        <StatusBadge status={deal.status} />
      </View>

      <View style={styles.row}>
        <Text style={styles.dealValue}>{formatINR(deal.deal_value)}</Text>
        <Text style={styles.muted}>{deal.brand_name}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.muted}>
          {deal.expected_close_date
            ? `Close: ${deal.expected_close_date}`
            : "No close date"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 4 },
  list: { padding: 16, paddingTop: 0, gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  muted: { color: colors.textDim, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dealValue: { color: colors.yellow, fontSize: 20, fontWeight: "700" },
  footer: { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 8 },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.3)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
  },
  errorText: { color: "#fca5a5", fontSize: 13 },
  empty: { color: colors.textDim, textAlign: "center", marginTop: 40 },
});
