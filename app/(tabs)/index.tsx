import NfcPromptAndroid from "@/components/NfcPromptAndroid";
import TagDataCard from "@/components/TagDataCard";
import nfcService from "@/services/nfcService";
import type { TagData } from "@/types";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Banner,
  Button,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { getNewOutlet, useOutlet } from "reconnect.js";

getNewOutlet(
  "androidPrompt",
  {
    visible: false,
  },
  { autoDelete: false }
);

getNewOutlet(
  "tagData",
  {
    data: null,
  },
  { autoDelete: false }
);

interface AndroidPromptData {
  visible: boolean;
  message?: string;
}

export default function HomeScreen() {
  const theme = useTheme();
  const [nfcSupported, setNfcSupported] = useState(true);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarAction, setSnackbarAction] = useState<
    | {
        label: string;
        onPress: () => void;
      }
    | undefined
  >(undefined);
  const [, setAndroidPrompt] = useOutlet<AndroidPromptData>("androidPrompt");
  const [sharedTagDataState, setSharedTagData] = useOutlet<{
    data: TagData | null;
  }>("tagData");

  const tagData = sharedTagDataState?.data || null;

  const showSnackbar = (
    message: string,
    action?: { label: string; onPress: () => void }
  ) => {
    setSnackbarMessage(message);
    setSnackbarAction(action);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    const initNFC = async () => {
      const initialized = await nfcService.init();
      setNfcSupported(initialized);

      if (initialized) {
        const enabled = await nfcService.isEnabled();
        setNfcEnabled(enabled);
      }
    };
    initNFC();
  }, []);

  const handleScan = async () => {
    if (!nfcEnabled) {
      return;
    }

    setLoading(true);

    try {
      setAndroidPrompt({
        visible: true,
        message: "Hold your phone near the RFID tag...",
      });

      const result = await nfcService.readTag();

      if (result.success && result.data) {
        setSharedTagData({ data: result.data });
        showSnackbar("Tag read successfully!");
      } else {
        showSnackbar(result.error || "Failed to read tag");
      }
    } catch (error: any) {
      showSnackbar(error.message || "An error occurred while scanning");
    } finally {
      setLoading(false);
      setAndroidPrompt({ visible: false });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <Appbar.Header>
        <Appbar.Content title="QIDI RFID Tag Manager" />
      </Appbar.Header>

      {!nfcSupported && (
        <Banner visible icon="alert-circle" actions={[]}>
          NFC is not supported on this device
        </Banner>
      )}

      {nfcSupported && !nfcEnabled && (
        <Banner
          visible
          icon="nfc-variant-off"
          actions={[
            {
              label: "Enable",
              onPress: () => {
                showSnackbar("Please enable NFC in your device settings");
              },
            },
          ]}
        >
          NFC is disabled. Please enable it in your device settings to use this
          app.
        </Banner>
      )}

      <ScrollView
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Scan RFID Tag
          </Text>
          <Text variant="bodyMedium" style={styles.instructions}>
            Hold your phone near the RFID tag to read its information.
          </Text>

          <View style={styles.section}>
            <TagDataCard data={tagData} />
          </View>

          <Button
            mode="contained"
            onPress={handleScan}
            disabled={loading || !nfcEnabled}
            icon="nfc-variant"
            style={styles.scanButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? "Scanning..." : "Scan Tag"}
          </Button>
          {loading && (
            <ActivityIndicator animating={true} style={styles.loader} />
          )}
        </View>

        {tagData && (
          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.instructions}>
              To write new data to this tag, go to the "Write" tab below.
            </Text>
          </View>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={snackbarAction}
      >
        {snackbarMessage}
      </Snackbar>

      <NfcPromptAndroid />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  instructions: {
    marginBottom: 16,
    opacity: 0.7,
  },
  scanButton: {
    marginTop: 8,
  },
  writeButton: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loader: {
    marginTop: 16,
  },
});
