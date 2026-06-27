/**
 * Addresses Screen
 * GET /api/customer/addresses + add/delete/set-default
 */

import {
  useAddAddress,
  useCustomerAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/src/api/useCustomer';
import { Header } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
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

const emptyForm = { name: '', street: '', city: '', state: '', country: '', postalCode: '' };

export default function AddressesScreen() {
  const { data: addresses, isLoading, isError, refetch } = useCustomerAddresses();
  const addAddress = useAddAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.street.trim() || !form.city.trim() || !form.country.trim()) {
      Alert.alert('Validation', 'Name, street, city and country are required.');
      return;
    }
    try {
      await addAddress.mutateAsync({ ...form });
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
                    <Text style={styles.addrName}>{addr.name}</Text>
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
                <Text style={styles.addrLine}>{addr.street}</Text>
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
              {([
                { key: 'name', label: 'Label (e.g. Home, Work)', placeholder: 'Home' },
                { key: 'street', label: 'Street Address', placeholder: '123 Main St' },
                { key: 'city', label: 'City', placeholder: 'Kinshasa' },
                { key: 'state', label: 'State / Province (optional)', placeholder: '' },
                { key: 'country', label: 'Country', placeholder: 'DRC' },
                { key: 'postalCode', label: 'Postal Code (optional)', placeholder: '' },
              ] as const).map(field => (
                <View key={field.key}>
                  <Text style={styles.label}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={form[field.key]}
                    onChangeText={val => setForm(f => ({ ...f, [field.key]: val }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              ))}
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
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.md, color: Colors.text.secondary, marginTop: Spacing.sm },
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  cardDefault: { borderColor: Colors.primary, borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  addrName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  defaultBadge: { backgroundColor: Colors.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  defaultBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  cardActions: { flexDirection: 'row', gap: Spacing.xs },
  iconBtn: { padding: 4 },
  addrLine: { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg, marginTop: Spacing.md,
  },
  addBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  errorText: { fontSize: FontSize.md, color: Colors.text.secondary, marginTop: Spacing.md },
  retryBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  retryText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border.light },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  modalScroll: { padding: Spacing.lg, paddingBottom: Spacing['4xl'], gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    borderWidth: 1, borderColor: Colors.border.medium, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    fontSize: FontSize.md, color: Colors.text.primary, backgroundColor: Colors.background.secondary,
  },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.xl },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
