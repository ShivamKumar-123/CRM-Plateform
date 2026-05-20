import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");
  const { login, loading } = useAuth();

  const handleSubmit = async () => {
    setError("");
    if (!username || !password) {
      setError("Enter username and password");
      return;
    }
    if (needs2FA && !otp) {
      setError("Enter the 6-digit code from your authenticator app");
      return;
    }
    const res = await login(username.trim(), password, needs2FA ? otp : undefined);
    if (res.ok) {
      // navigator auto-redirects on auth state change
    } else if (res.requires2fa) {
      setNeeds2FA(true);
      setError("");
    } else {
      setError(res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Ionicons name="flash" size={26} color="#000" />
          </View>
          <Text style={styles.brand}>CRM SUITE</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>USERNAME</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="person-outline"
              size={16}
              color={colors.textFaint}
              style={styles.inputIcon}
            />
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="your.username"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={colors.textFaint}
              style={styles.inputIcon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />
          </View>
        </View>

        {needs2FA && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.yellow }]}>
              TWO-FACTOR CODE
            </Text>
            <View style={[styles.inputWrap, styles.otpWrap]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={colors.yellow}
                style={styles.inputIcon}
              />
              <TextInput
                value={otp}
                onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                placeholder="123 456"
                placeholderTextColor={colors.textFaint}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                style={[styles.input, styles.otpInput]}
              />
            </View>
            <Text style={styles.hint}>
              Enter the 6-digit code from your authenticator app, or a backup code.
            </Text>
          </View>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
          style={[styles.button, loading && { opacity: 0.6 }]}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(250,204,21,0.2)",
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 28,
  },
  logoWrap: { alignItems: "center", marginBottom: 28 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: colors.yellow,
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  brand: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 4,
  },
  subtitle: { color: colors.textDim, fontSize: 13, marginTop: 6 },
  field: { marginBottom: 16 },
  label: {
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
    fontSize: 15,
  },
  otpWrap: {
    backgroundColor: "rgba(250,204,21,0.05)",
    borderColor: "rgba(250,204,21,0.4)",
  },
  otpInput: {
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: "700",
  },
  hint: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.3)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: "#fca5a5", fontSize: 13 },
  button: {
    backgroundColor: colors.yellow,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#000", fontSize: 15, fontWeight: "700" },
});
