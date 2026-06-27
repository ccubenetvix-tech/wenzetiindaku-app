/**
 * Profile View Screen
 * Shows current customer profile from GET /api/customer/profile
 */

import { useCustomerProfile } from '@/src/api/useCustomer';
import { Header } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading, isError, refetch } = useCustomerProfile();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Profile" showSearch={false} showBack />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            {(profile as any)?.profilePhoto ? (
              <Image source={{ uri: (profile as any).profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={Colors.white} />
              </View>
            )}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/profile/edit')}
            >
              <Ionicons name="pencil-outline" size={16} color={Colors.white} />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <ProfileRow label="First Name" value={(profile as any)?.firstName} />
            <ProfileRow label="Last Name" value={(profile as any)?.lastName} />
            <ProfileRow label="Email" value={(profile as any)?.email} />
            <ProfileRow label="Phone" value={(profile as any)?.phoneNumber} />
            <ProfileRow label="Gender" value={(profile as any)?.gender} />
            <ProfileRow label="Date of Birth" value={(profile as any)?.dateOfBirth} />
          </View>

          {/* Address preview */}
          {(profile as any)?.address && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Address</Text>
              <Text style={styles.rowValue}>{(profile as any).address}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  scroll: { paddingBottom: Spacing['4xl'] },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing['2xl'], backgroundColor: Colors.white, marginBottom: Spacing.lg },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: Spacing.md },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  editBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
    ...Shadow.sm,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border.light },
  rowLabel: { fontSize: FontSize.sm, color: Colors.text.secondary },
  rowValue: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.medium, flex: 1, textAlign: 'right' },
  errorText: { fontSize: FontSize.md, color: Colors.text.secondary, marginTop: Spacing.md },
  retryBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  retryText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
