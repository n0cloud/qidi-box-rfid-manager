import NfcPromptAndroid from "@/components/NfcPromptAndroid";
import { COLORS } from "@/constants/colors";
import { MATERIALS } from "@/constants/materials";
import nfcService from "@/services/nfcService";
import type { TagData } from "@/types";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Banner,
  Button,
  Card,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOutlet } from "reconnect.js";

interface AndroidPromptData {
  visible: boolean;
  message?: string;
}

export default function WriteScreen() {
  const theme = useTheme();

  const [sharedTagDataState, setSharedTagData] = useOutlet<{ data: TagData | null }>("tagData");
  const tagData = sharedTagDataState?.data || null;

  const [nfcSupported, setNfcSupported] = useState(true);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(
    tagData?.materialCode || null
  );
  const [selectedColor, setSelectedColor] = useState<number | null>(
    tagData?.colorCode || null
  );
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

  // Update selected values when tag data changes
  useEffect(() => {
    if (tagData) {
      setSelectedMaterial(tagData.materialCode);
      setSelectedColor(tagData.colorCode);
    }
  }, [tagData]);

  const handleWrite = async () => {
    if (!tagData) {
      showSnackbar(
        "No tag data available. Please scan a tag in the Read tab first."
      );
      return;
    }

    if (!nfcEnabled) {
      return;
    }

    if (!selectedMaterial || !selectedColor) {
      showSnackbar("Please select both material and color");
      return;
    }

    setLoading(true);

    try {
      setAndroidPrompt({
        visible: true,
        message: "Hold your phone near the RFID tag to write...",
      });

      const result = await nfcService.writeTag(
        selectedMaterial,
        selectedColor,
        1
      );

      setAndroidPrompt({ visible: false });

      if (result.success) {
        // Update shared tag data to reflect what was written
        const updatedData: TagData = {
          ...tagData,
          materialCode: selectedMaterial,
          colorCode: selectedColor,
          materialName:
            MATERIALS.find((m) => m.code === selectedMaterial)?.name ||
            "Unknown",
          colorName:
            COLORS.find((c) => c.code === selectedColor)?.name ||
            "Unknown",
          colorRgb:
            COLORS.find((c) => c.code === selectedColor)?.rgb ||
            "#000000",
        };
        setSharedTagData({ data: updatedData });
        showSnackbar("Data written to tag successfully!");
      } else {
        showSnackbar(result.error || "Failed to write to tag");
      }
    } catch (error: any) {
      setAndroidPrompt({ visible: false });
      showSnackbar(error.message || "An error occurred while writing");
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterialData = selectedMaterial
    ? MATERIALS.find((m) => m.code === selectedMaterial)
    : null;
  const selectedColorData = selectedColor
    ? COLORS.find((c) => c.code === selectedColor)
    : null;

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
        {!tagData ? (
          <View style={styles.emptyState}>
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="headlineSmall" style={styles.emptyTitle}>
                  No Tag Scanned
                </Text>
                <Text variant="bodyMedium" style={styles.emptyMessage}>
                  Please scan a tag in the "Read" tab first, then come back here
                  to write new data.
                </Text>
              </Card.Content>
            </Card>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                Current Tag Data
              </Text>
              <Card style={styles.currentDataCard}>
                <Card.Content>
                  <View style={styles.dataRow}>
                    <Text variant="labelLarge">Material:</Text>
                    <Text variant="bodyLarge">{tagData.materialName}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text variant="labelLarge">Color:</Text>
                    <View style={styles.colorRow}>
                      <View
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor: tagData.colorRgb,
                            borderColor: theme.colors.outline,
                          },
                        ]}
                      />
                      <Text variant="bodyLarge">{tagData.colorName}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.section}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                Write New Data
              </Text>
              <Text variant="bodyMedium" style={styles.instructions}>
                Select the material and color, then write to the tag.
              </Text>

              <View style={styles.dropdownContainer}>
                <Text variant="labelLarge" style={styles.dropdownLabel}>
                  Material Type
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    { borderColor: theme.colors.outline },
                  ]}
                >
                  <RNPickerSelect
                    value={selectedMaterial}
                    onValueChange={(value) => setSelectedMaterial(value)}
                    items={MATERIALS.map((material) => ({
                      label: material.name,
                      value: material.code,
                      color: theme.colors.onSurface,
                    }))}
                    style={{
                      inputIOS: {
                        ...styles.pickerInput,
                        color: theme.colors.onSurface,
                      },
                      inputAndroid: {
                        ...styles.pickerInput,
                        color: theme.colors.onSurface,
                      },
                      iconContainer: styles.pickerIconContainer,
                    }}
                    useNativeAndroidPickerStyle={false}
                  >
                    <Text
                      style={{
                        color: theme.colors.onSurface,
                        opacity: selectedMaterialData ? 1 : 0.54,
                      }}
                    >
                      {selectedMaterialData
                        ? selectedMaterialData.name
                        : "Select a material..."}
                    </Text>
                  </RNPickerSelect>
                </View>
              </View>

              <View style={styles.dropdownContainer}>
                <Text variant="labelLarge" style={styles.dropdownLabel}>
                  Color
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    { borderColor: theme.colors.outline },
                  ]}
                >
                  <RNPickerSelect
                    value={selectedColor}
                    onValueChange={(value) => setSelectedColor(value)}
                    items={COLORS.map((color) => ({
                      label: color.name,
                      value: color.code,
                      color: color.rgb,
                    }))}
                    style={{
                      inputIOS: {
                        ...styles.pickerInput,
                        color: theme.colors.onSurface,
                      },
                      inputAndroid: {
                        ...styles.pickerInput,
                        color: theme.colors.onSurface,
                      },
                      iconContainer: styles.pickerIconContainer,
                    }}
                    useNativeAndroidPickerStyle={false}
                  >
                    <Text
                      style={{
                        color: theme.colors.onSurface,
                        opacity: selectedColorData ? 1 : 0.54,
                        paddingLeft: selectedColorData ? 36 : 0,
                      }}
                    >
                      {selectedColorData
                        ? selectedColorData.name
                        : "Select a color..."}
                    </Text>
                    {selectedColorData && (
                      <View style={styles.colorPreviewContainer}>
                        <View
                          style={[
                            styles.colorDot,
                            {
                              backgroundColor: selectedColorData.rgb,
                              borderColor: theme.colors.outline,
                            },
                          ]}
                        />
                      </View>
                    )}
                  </RNPickerSelect>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleWrite}
                disabled={loading || !nfcEnabled}
                icon="pencil"
                style={styles.writeButton}
                contentStyle={styles.buttonContent}
              >
                {loading ? "Writing..." : "Write to Tag"}
              </Button>
            </View>
          </>
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
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  instructions: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyCard: {
    width: "100%",
    maxWidth: 400,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
    opacity: 0.7,
  },
  currentDataCard: {
    marginTop: 8,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  writeButton: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    minHeight: 56,
    justifyContent: "center",
    position: "relative",
  },
  pickerInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingRight: 30,
  },
  pickerIconContainer: {
    top: 20,
    right: 12,
  },
  colorPreviewContainer: {
    position: "absolute",
    left: 6,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
});
