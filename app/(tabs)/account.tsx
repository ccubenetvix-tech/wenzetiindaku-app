// app/(tabs)/account.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import {
  useCustomerProfile,
  useCustomerOrders,
  useCustomerAddresses,
  useWishlist,
} from '@/src/api/useCustomer';

export default function AccountScreen() {
  const { data: profile } = useCustomerProfile();
  const { data: orders } = useCustomerOrders();
  const { data: addresses } = useCustomerAddresses();
  const { data: wishlist } = useWishlist();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {profile && (
        <>
          <Text>{profile.name}</Text>
          <Text>{profile.email}</Text>
        </>
      )}

      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Orders</Text>
      <FlatList
        data={orders ?? []}
        keyExtractor={o => o.id}
        renderItem={({ item }) => (
          <View>
            <Text>#{item.orderNumber} – {item.status}</Text>
            <Text>Total: {item.total}</Text>
          </View>
        )}
      />

      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Addresses</Text>
      <FlatList
        data={addresses ?? []}
        keyExtractor={a => a.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Text>{item.street}, {item.city}</Text>
          </View>
        )}
      />

      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Wishlist</Text>
      <FlatList
        data={wishlist ?? []}
        keyExtractor={w => w.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.product.name}</Text>
            <Text>{item.product.price}</Text>
          </View>
        )}
      />
    </View>
  );
}