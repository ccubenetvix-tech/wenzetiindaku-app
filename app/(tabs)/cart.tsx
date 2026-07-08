// app/(tabs)/cart.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useSyncedCart } from '@/src/api/useCart';
import { useAuth } from '@/contexts/auth-context';
import { useCartTotal } from '@/src/api/useCart';

export default function CartScreen() {
  const { isAuthenticated } = useAuth();
  const {
    items,
    add,
    update,
    remove,
    clear,
    loadRemoteCart,
    getItemQuantity,
  } = useSyncedCart();
  const total = useCartTotal();

  useEffect(() => {
    if (isAuthenticated) {
      loadRemoteCart().catch(err => {
        console.warn('Failed to load remote cart', err);
      });
    }
  }, [isAuthenticated, loadRemoteCart]);

  const handleIncrease = (productId: string) => {
    const current = getItemQuantity(productId);
    update(productId, current + 1);
  };

  const handleDecrease = (productId: string) => {
    const current = getItemQuantity(productId);
    update(productId, current - 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12 }}>
            <Text>{item.product.name}</Text>
            <Text>
              {item.quantity} × {item.price}
            </Text>
            <Button title="+" onPress={() => handleIncrease(item.productId)} />
            <Button title="-" onPress={() => handleDecrease(item.productId)} />
            <Button title="Remove" onPress={() => remove(item.productId)} />
          </View>
        )}
      />
      <View style={{ padding: 12 }}>
        <Text>Total: {total}</Text>
        <Button title="Clear cart" onPress={clear} />
      </View>
    </View>
  );
}