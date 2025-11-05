import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Read",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="nfc-search-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="write"
        options={{
          title: "Write",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pencil" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
