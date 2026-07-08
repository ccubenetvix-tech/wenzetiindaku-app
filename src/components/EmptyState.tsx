// src/components/EmptyState.tsx
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "@/src/theme";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function EmptyState({
  title = "Nothing here yet",
  message = "Check back later or try a different search.",
  icon = "alert-circle-outline",
}: EmptyStateProps) {
  return (
    <View
      style={{
        padding: Spacing["2xl"],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: BorderRadius.full,
          backgroundColor: Colors.gray[100],
          alignItems: "center",
          justifyContent: "center",
          marginBottom: Spacing.lg,
        }}
      >
        <Ionicons name={icon} size={32} color={Colors.gray[400]} />
      </View>
      <Text
        style={{
          fontSize: FontSize.lg,
          fontWeight: FontWeight.semibold,
          color: Colors.text.primary,
          marginBottom: Spacing.sm,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: FontSize.md,
          color: Colors.text.secondary,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </View>
  );
}
