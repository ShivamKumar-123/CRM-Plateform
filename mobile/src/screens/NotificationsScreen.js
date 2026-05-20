import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/api";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius } from "../theme";

const TYPE_ICON = {
  info:             { icon: "information-circle-outline", color: colors.sky },
  success:          { icon: "checkmark-circle-outline",   color: colors.green },
  warning:          { icon: "warning-outline",            color: colors.amber },
  error:            { icon: "alert-circle-outline",       color: colors.red },
  lead_assigned:    { icon: "person-add-outline",         color: colors.yellow },
  deal_won:         { icon: "trophy-outline",             color: colors.green },
  task_due:         { icon: "calendar-outline",           color: colors.pink },
  payment_received: { icon: "cash-outline",               color: colors.green },
};

const relativeTime = (iso) => {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const d = await api.getNotifications();
      setItems(d?.notifications || []);
      setUnread(d?.unread_count || 0);
    } catch (e) {
      setError(e.message);
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

  const markRead = async (n) => {
    if (n.read) return;
    try {
      await api.markNotificationRead(n.id);
      load();
    } catch (_) {}
  };

  const markAllRead = async () => {
    if (unread === 0) return;
    Alert.alert("Mark all as read?", `${unread} unread notification(s).`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark all",
        onPress: async () => {
          await api.markAllNotificationsRead().catch(() => {});
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Notifications"
        subtitle={
          unread > 0
            ? `${unread} unread`
            : items.length > 0
            ? `${items.length} total · all read`
            : "You're all caught up"
        }
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {unread > 0 && (
        <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
          <Ionicons name="checkmark-done" size={14} color={colors.yellow} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && !refreshing ? (
        <ActivityIndicator color={colors.yellow} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={() => markRead(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.yellow}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={colors.textFaint}
              />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyBody}>
                You'll be pinged here when leads, deals, or tasks change.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function NotificationRow({ notification: n, onPress }) {
  const cfg = TYPE_ICON[n.type] || TYPE_ICON.info;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, !n.read && styles.cardUnread]}
    >
      <View style={[styles.iconWrap, { backgroundColor: cfg.color }]}>
        <Ionicons name={cfg.icon} size={18} color="#000" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {n.title}
          </Text>
          {!n.read && <View style={styles.dot} />}
        </View>
        {!!n.body && (
          <Text style={styles.body} numberOfLines={2}>
            {n.body}
          </Text>
        )}
        <Text style={styles.timestamp}>{relativeTime(n.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(250,204,21,0.1)",
    borderColor: "rgba(250,204,21,0.3)",
    borderWidth: 1,
  },
  markAllText: { color: colors.yellow, fontSize: 12, fontWeight: "600" },
  list: { padding: 16, paddingTop: 0, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  cardUnread: {
    backgroundColor: "rgba(250,204,21,0.06)",
    borderColor: "rgba(250,204,21,0.25)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: colors.text, fontSize: 14, fontWeight: "700", flex: 1 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.yellow,
    flexShrink: 0,
  },
  body: { color: colors.textDim, fontSize: 12, marginTop: 4, lineHeight: 17 },
  timestamp: { color: colors.textFaint, fontSize: 10, marginTop: 6 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 10 },
  emptyBody: { color: colors.textDim, fontSize: 12, textAlign: "center", paddingHorizontal: 40 },
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
});
