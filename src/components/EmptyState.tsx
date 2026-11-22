// src/components/EmptyState.tsx
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = "Nothing here yet",
  message = "Check back later or try a different search.",
  icon = "alert-circle-outline",
  actionLabel,
  onAction,
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
          fontFamily: FontFamily.semibold,
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
          fontFamily: FontFamily.normal,
          color: Colors.text.secondary,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            marginTop: Spacing.xl,
            backgroundColor: Colors.primary,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing["2xl"],
            borderRadius: BorderRadius.lg,
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: FontSize.md,
              fontFamily: FontFamily.semibold,
            }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
