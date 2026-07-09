import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../api/client';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';

type CartItem = { id: number; productId: number; productName?: string; quantity: number; price: string; targetInfo?: string };

export default function CartScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [checkingOut, setCheckingOut] = React.useState(false);

  const { data: cart, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => apiGet<CartItem[]>('/api/cart'),
  });

  const total = (cart || []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  async function removeItem(id: number) {
    try {
      await apiDelete(`/api/cart/${id}`);
      qc.invalidateQueries({ queryKey: ['cart'] });
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    }
  }

  async function checkout() {
    if (!cart?.length) return;
    setCheckingOut(true);
    try {
      await apiPost('/api/cart/checkout');
      qc.invalidateQueries({ queryKey: ['cart', 'orders', 'wallet'] });
      Alert.alert('✅ تم الطلب', 'تم تقديم جميع الطلبات بنجاح!', [
        { text: 'موافق', onPress: () => nav.navigate('Main', { screen: 'Orders' }) },
      ]);
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل إتمام الطلبات');
    } finally { setCheckingOut(false); }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
          <Text style={s.backArrow}>→</Text>
        </TouchableOpacity>
        <Text style={s.title}>🛒 السلة</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? <Loading /> : (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={s.list}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <View style={s.card}>
                <View style={s.cardLeft}>
                  <TouchableOpacity onPress={() => Alert.alert('إزالة', 'حذف من السلة؟', [
                    { text: 'إلغاء', style: 'cancel' },
                    { text: 'حذف', style: 'destructive', onPress: () => removeItem(item.id) },
                  ])}>
                    <Text style={s.removeText}>🗑️</Text>
                  </TouchableOpacity>
                  <View>
                    <Text style={s.qty}>x{item.quantity}</Text>
                    <Text style={s.price}>{(Number(item.price) * item.quantity).toFixed(2)} SDG</Text>
                  </View>
                </View>
                <View style={s.cardRight}>
                  <Text style={s.productName}>{item.productName || `منتج #${item.productId}`}</Text>
                  {item.targetInfo && <Text style={s.targetInfo}>{item.targetInfo}</Text>}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyIcon}>🛒</Text>
                <Text style={s.emptyText}>السلة فارغة</Text>
              </View>
            }
          />
          {cart && cart.length > 0 && (
            <View style={[s.checkoutBar, { paddingBottom: insets.bottom + 8 }]}>
              <View>
                <Text style={s.totalLabel}>الإجمالي</Text>
                <Text style={s.totalAmount}>{total.toFixed(2)} SDG</Text>
              </View>
              <TouchableOpacity style={[s.checkoutBtn, checkingOut && { opacity: 0.7 }]} onPress={checkout} disabled={checkingOut}>
                {checkingOut ? <ActivityIndicator color="#fff" /> : <Text style={s.checkoutBtnText}>✅ إتمام الطلب</Text>}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.pink50, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: Colors.primary },
  title: { fontSize: 17, fontWeight: '800', color: Colors.text },
  list: { padding: 12, gap: 10 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14,
    borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardLeft: { alignItems: 'center', gap: 8 },
  removeText: { fontSize: 22 },
  qty: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  price: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  cardRight: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: Colors.text, textAlign: 'right', marginBottom: 4 },
  targetInfo: { fontSize: 12, color: Colors.textMuted, textAlign: 'right' },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  checkoutBar: {
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, elevation: 8,
  },
  totalLabel: { fontSize: 12, color: Colors.textMuted },
  totalAmount: { fontSize: 22, fontWeight: '900', color: Colors.primary },
  checkoutBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24 },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
