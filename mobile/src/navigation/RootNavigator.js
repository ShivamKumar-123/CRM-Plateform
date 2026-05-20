import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import LandingScreen from "../screens/LandingScreen";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import LeadsScreen from "../screens/LeadsScreen";
import DealsScreen from "../screens/DealsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.yellow,
  },
};

function tabIcon(routeName) {
  return ({ color, size }) => {
    let icon = "ellipse";
    if (routeName === "Dashboard")          icon = "grid-outline";
    else if (routeName === "Leads")         icon = "people-outline";
    else if (routeName === "Deals")         icon = "briefcase-outline";
    else if (routeName === "Notifications") icon = "notifications-outline";
    else if (routeName === "Profile")       icon = "person-outline";
    return <Ionicons name={icon} size={size} color={color} />;
  };
}

function AppTabs() {
  const [unread, setUnread] = useState(0);

  // Poll unread notifications count every 60s so the bell badge stays fresh
  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const d = await api.getNotifications();
        if (mounted) setUnread(d?.unread_count || 0);
      } catch (_) {}
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: tabIcon(route.name),
        tabBarActiveTintColor: colors.yellow,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgSoft,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Leads" component={LeadsScreen} />
      <Tab.Screen name="Deals" component={DealsScreen} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarBadge: unread > 0 ? (unread > 9 ? "9+" : String(unread)) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.yellow,
            color: "#000",
            fontWeight: "700",
            fontSize: 10,
            minWidth: 16,
            height: 16,
          },
        }}
        listeners={{
          // When user opens the tab, clear the badge optimistically (server fetches fresh count anyway)
          tabPress: () => {
            // do nothing — actual mark-read happens inside the screen
          },
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { bootstrapping, isAuthenticated } = useAuth();

  if (bootstrapping) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.yellow} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
