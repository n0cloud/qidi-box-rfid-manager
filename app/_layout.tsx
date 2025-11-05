import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
