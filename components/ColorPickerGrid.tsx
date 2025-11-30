import type { Color } from "@/types";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface ColorPickerGridProps {
  colors: Color[];
  selectedCode: number | null;
  onSelectColor: (code: number) => void;
}

export default function ColorPickerGrid({
  colors,
  selectedCode,
  onSelectColor,
}: ColorPickerGridProps) {
  const theme = useTheme();

  const renderColorItem = ({ item }: { item: Color }) => {
    const isSelected = item.code === selectedCode;

    return (
      <TouchableOpacity
        style={styles.colorItemContainer}
        onPress={() => onSelectColor(item.code)}
      >
        <View
          style={[
            styles.colorSwatch,
            {
              backgroundColor: item.rgb,
              borderColor: isSelected
                ? theme.colors.primary
                : theme.colors.outline,
              borderWidth: isSelected ? 3 : 1,
            },
          ]}
        />
        <Text
          variant="labelSmall"
          style={[
            styles.colorName,
            {
              color: theme.colors.onSurface,
              fontWeight: isSelected ? "bold" : "normal",
            },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={colors}
      keyExtractor={(item) => `color-${item.code}`}
      renderItem={renderColorItem}
      numColumns={4}
      scrollEnabled={false}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  colorItemContainer: {
    alignItems: "center",
    width: "22%",
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  colorName: {
    textAlign: "center",
    fontSize: 10,
  },
});
