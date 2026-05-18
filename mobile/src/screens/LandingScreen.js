import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "../theme";

const { width } = Dimensions.get("window");

const features = [
  {
    icon: "people-outline",
    title: "Lead pipeline",
    body: "Every lead, every status — at a glance.",
    tint: colors.yellow,
  },
  {
    icon: "briefcase-outline",
    title: "Deal tracking",
    body: "Open, Won, Cancelled. Track profit on each.",
    tint: colors.sky,
  },
  {
    icon: "analytics-outline",
    title: "Live analytics",
    body: "Revenue, win rate, team performance.",
    tint: colors.green,
  },
];

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.root}>
      {/* Background glow */}
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + brand */}
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Ionicons name="flash" size={20} color="#000" />
            </View>
            <Text style={styles.brand}>CRM SUITE</Text>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.eyebrow}>
              <Ionicons name="sparkles" size={11} color={colors.yellow} />
              <Text style={styles.eyebrowText}>FOR INDIAN SOLAR TEAMS</Text>
            </View>

            <Text style={styles.heroTitle}>
              Close more{"\n"}
              <Text style={styles.heroAccent}>solar deals</Text>
              {"\n"}
              in half the time.
            </Text>

            <Text style={styles.heroSub}>
              Replace your WhatsApp groups, Excel sheets, and sticky notes with one
              clean pipeline.
            </Text>
          </View>

          {/* Mock card stack preview */}
          <View style={styles.previewWrap}>
            <View style={[styles.previewCard, styles.previewCardBack]}>
              <Text style={styles.previewLabel}>LEAD #1248</Text>
              <Text style={styles.previewName}>Priya Sharma</Text>
              <Text style={styles.previewMeta}>Adani · 10kW · Pune</Text>
              <View style={[styles.pill, { backgroundColor: colors.yellow }]}>
                <Text style={styles.pillText}>SITE VISIT</Text>
              </View>
            </View>
            <View style={[styles.previewCard, styles.previewCardFront]}>
              <Text style={styles.previewLabel}>LEAD #1247</Text>
              <Text style={styles.previewName}>Ramesh Kumar</Text>
              <Text style={styles.previewMeta}>Waaree · 5kW · Jaipur</Text>
              <View style={[styles.pill, { backgroundColor: colors.green }]}>
                <Text style={styles.pillText}>DEALED</Text>
              </View>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featureList}>
            {features.map((f) => (
              <View key={f.title} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: f.tint }]}>
                  <Ionicons name={f.icon} size={18} color="#000" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureBody}>{f.body}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Login")}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Login")}
            style={styles.secondaryCta}
          >
            <Text style={styles.secondaryCtaText}>I already have an account</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            © {new Date().getFullYear()} Advance International Solar
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  glow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.25,
  },
  glowTop: {
    backgroundColor: colors.yellow,
    top: -150,
    left: -150,
  },
  glowBottom: {
    backgroundColor: colors.sky,
    bottom: -150,
    right: -150,
  },

  scroll: { paddingHorizontal: 24, paddingBottom: 32 },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 24,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.yellow,
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  brand: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
  },

  hero: { marginTop: 12, marginBottom: 28 },
  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(250,204,21,0.1)",
    borderColor: "rgba(250,204,21,0.3)",
    borderWidth: 1,
    marginBottom: 18,
  },
  eyebrowText: {
    color: colors.yellow,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: colors.text,
    fontSize: width < 380 ? 34 : 40,
    fontWeight: "900",
    lineHeight: width < 380 ? 40 : 46,
    letterSpacing: -1,
  },
  heroAccent: { color: colors.yellow },
  heroSub: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
    maxWidth: 340,
  },

  previewWrap: {
    height: 200,
    marginVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  previewCard: {
    width: "92%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    position: "absolute",
  },
  previewCardBack: {
    transform: [{ translateY: -30 }, { rotate: "-2deg" }, { scale: 0.95 }],
    borderColor: "rgba(56,189,248,0.25)",
    opacity: 0.6,
  },
  previewCardFront: {
    transform: [{ translateY: 20 }, { rotate: "1.5deg" }],
    borderColor: "rgba(250,204,21,0.3)",
    shadowColor: colors.yellow,
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  previewLabel: { color: colors.textFaint, fontSize: 10, letterSpacing: 1.2 },
  previewName: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 4 },
  previewMeta: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 10,
  },
  pillText: { color: "#000", fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },

  featureList: { gap: 12, marginVertical: 8 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  featureBody: { color: colors.textDim, fontSize: 12, marginTop: 2 },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.yellow,
    borderRadius: radius.lg,
    paddingVertical: 16,
    marginTop: 28,
    shadowColor: colors.yellow,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaText: { color: "#000", fontSize: 16, fontWeight: "800" },
  secondaryCta: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  secondaryCtaText: { color: colors.textDim, fontSize: 13 },
  footer: {
    textAlign: "center",
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 16,
  },
});
