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

export default function LeadsScreen() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await api.getLeads();
      setLeads(data?.leads || []);
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
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        String(l.id) === search ||
        l.phone?.includes(search) ||
        l.name?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q)
    );
  }, [search, leads]);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Leads"
        subtitle={stats ? `${stats.total_leads} total · ${stats.new_leads} new` : null}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textFaint} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, phone, city, ID..."
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
          renderItem={({ item }) => <LeadCard lead={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.yellow}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {leads.length === 0 ? "No leads yet." : "No matching leads."}
            </Text>
          }
        />
      )}
    </View>
  );
}

function LeadCard({ lead }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.name} numberOfLines={1}>
            {lead.name}
          </Text>
          <Text style={styles.muted}>{lead.phone}</Text>
        </View>
        <StatusBadge status={lead.status} />
      </View>

      <View style={styles.metaRow}>
        <Meta icon="location-outline" text={lead.city || "—"} />
        <Meta icon="cube-outline" text={lead.brand_name || "—"} />
        <Meta icon="flash-outline" text={lead.watt_capacity || "—"} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.muted}>
          Source: <Text style={styles.value}>{lead.leads_source}</Text>
        </Text>
        <Text style={styles.muted}>
          Assigned: <Text style={styles.value}>{lead.assigned_to_username || "—"}</Text>
        </Text>
      </View>
    </View>
  );
}

function Meta({ icon, text }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={13} color={colors.textDim} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
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
  value: { color: colors.text },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: colors.textDim, fontSize: 12, maxWidth: 110 },
  footer: { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 8, gap: 2 },
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
