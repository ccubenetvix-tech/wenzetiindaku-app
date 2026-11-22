/**
 * Addresses Screen
 * GET /api/customer/addresses + add/delete/set-default
 */

import { useAuth } from '@/contexts/auth-context';
import {
  useAddAddress,
  useCustomerAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/src/api/useCustomer';
import { Header } from '@/src/components';
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const emptyForm = {
  label: 'Home',
  fullName: '',
  phone: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Democratic Republic of Congo',
};

export default function AddressesScreen() {
  const { user } = useAuth();
  const { data: addresses, isLoading, isError, refetch } = useCustomerAddresses();
  const addAddress = useAddAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const setField = (key: keyof typeof emptyForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleAdd = async () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.street1.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim() || !form.country.trim()) {
      Alert.alert('Validation', 'Full name, phone, street, city, state, postal code and country are required.');
      return;
    }
    try {
      await addAddress.mutateAsync({
        label: form.label,
        fullName: form.fullName.trim(),
        email: user?.email || '',
        phone: form.phone.trim(),
        street1: form.street1.trim(),
        street2: form.street2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
      });
      setModalVisible(false);
      setForm(emptyForm);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to add address.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAddress.mutate(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Addresses" showSearch={false} showBack />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Failed to load addresses</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {(!addresses || addresses.length === 0) ? (
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={64} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>No addresses saved</Text>
              <Text style={styles.emptyText}>Add a delivery address to get started</Text>
            </View>
          ) : (
            addresses.map((addr: any) => (
              <View key={addr.id} style={[styles.card, addr.isDefault && styles.cardDefault]}>
                <View style={styles.cardHeader}>
                  <View style={styles.nameRow}>
                    <Ionicons name="location" size={18} color={Colors.primary} />
                    <Text style={styles.addrName}>{addr.label || 'Address'}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardActions}>
                    {!addr.isDefault && (
                      <TouchableOpacity onPress={() => setDefault.mutate(addr.id)} style={styles.iconBtn}>
                        <Ionicons name="checkmark-circle-outline" size={20} color={Colors.secondary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(addr.id)} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.addrName}>{addr.fullName}</Text>
                {addr.phone ? <Text style={styles.addrLine}>{addr.phone}</Text> : null}
                <Text style={styles.addrLine}>{[addr.street1, addr.street2].filter(Boolean).join(', ')}</Text>
                <Text style={styles.addrLine}>{[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}</Text>
                <Text style={styles.addrLine}>{addr.country}</Text>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Add Address Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Address</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setForm(emptyForm); }}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Address type chips */}
              <View style={styles.chipsRow}>
                {(['Home', 'Work', 'Other'] as const).map(label => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.chip, form.label === label && styles.chipActive]}
                    onPress={() => setField('label', label)}
                  >
                    <Text style={[styles.chipText, form.label === label && styles.chipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {([
                { key: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
                { key: 'phone', label: 'Phone Number', placeholder: '+243 XXX XXX XXX', keyboard: 'phone-pad' as const },
                { key: 'street1', label: 'House No / Street Address', placeholder: '123 Main St' },
                { key: 'street2', label: 'Apartment / Area (optional)', placeholder: 'Apt 4B, Downtown' },
                { key: 'city', label: 'City', placeholder: 'Kinshasa' },
                { key: 'state', label: 'State / Province', placeholder: 'Kinshasa' },
                { key: 'postalCode', label: 'Postal Code', placeholder: '12345', keyboard: 'numeric' as const },
                { key: 'country', label: 'Country', placeholder: 'Democratic Republic of Congo' },
              ] as const).map(field => (
                <View key={field.key}>
                  <Text style={styles.label}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={form[field.key]}
                    onChangeText={val => setField(field.key, val)}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.text.tertiary}
                    keyboardType={'keyboard' in field ? field.keyboard : 'default'}
                    autoCapitalize={field.key === 'phone' || field.key === 'postalCode' ? 'none' : 'sentences'}
                  />
                </View>
              ))}
              <Text style={styles.modalHint}>
                Saving to account email: {user?.email || '—'}
              </Text>
              <TouchableOpacity
                style={[styles.saveBtn, addAddress.isPending && styles.saveBtnDisabled]}
                onPress={handleAdd}
                disabled={addAddress.isPending}
              >
                {addAddress.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing['4xl'], gap: Spacing.md },
  empty: { alignItems: 'center', paddingTop: Spacing['5xl'] },
  emptyTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, color: Colors.text.primary, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.md, color: Colors.text.secondary, marginTop: Spacing.sm },
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  cardDefault: { borderColor: Colors.primary, borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  addrName: { fontSize: FontSize.md, fontFamily: FontFamily.bold, color: Colors.text.primary },
  defaultBadge: { backgroundColor: Colors.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  defaultBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontFamily: FontFamily.semibold },
  cardActions: { flexDirection: 'row', gap: Spacing.xs },
  iconBtn: { padding: 4 },
  addrLine: { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg, marginTop: Spacing.md,
  },
  addBtnText: { color: Colors.white, fontSize: FontSize.md, fontFamily: FontFamily.bold },
  errorText: { fontSize: FontSize.md, color: Colors.text.secondary, marginTop: Spacing.md },
  retryBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  retryText: { color: Colors.white, fontSize: FontSize.md, fontFamily: FontFamily.semibold },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border.light },
  modalTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: Colors.text.primary },
  chipsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.white,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  chipText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: Colors.text.secondary },
  chipTextActive: { color: Colors.primary, fontFamily: FontFamily.semibold },
  modalHint: { fontSize: FontSize.xs, fontFamily: FontFamily.normal, color: Colors.text.tertiary, marginTop: Spacing.md },
  modalScroll: { padding: Spacing.lg, paddingBottom: Spacing['4xl'], gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontFamily: FontFamily.semibold, color: Colors.text.secondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    borderWidth: 1, borderColor: Colors.border.medium, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    fontSize: FontSize.md, color: Colors.text.primary, backgroundColor: Colors.background.secondary,
  },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.xl },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.white, fontSize: FontSize.lg, fontFamily: FontFamily.bold },
});
