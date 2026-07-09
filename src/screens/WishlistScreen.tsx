import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '../api/client';
import { Colors, Radius } from '../theme/colors';
import { ProductCard, Product } from '../components/ProductCard';
import { Loading } from '../components/Loading';

export default function WishlistScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const { data: wishlist, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiGet<Product[]>('/api/wishlist'),
  });

  async function removeFromWishlist(id: number) {
    try {
      await apiDelete(`/api/wishlist/${id}`);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
          <Text style={s.backArrow}>→</Text>
        </TouchableOpacity>
        <Text style={s.title}>قائمة الأمنيات</Text>
        <View style={{ width: 36 }} />
      </View>
      {isLoading ? <Loading /> : (
        <FlatList
          data={wishlist}
          numColumns={2}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <View style={s.cardWrap}>
              <ProductCard
                product={item}
                onPress={() => nav.navigate('Product', { id: item.id })}
              />
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => Alert.alert('إزالة', 'هل تريد إزالة المنتج من الأمنيات؟', [
                  { text: 'إلغاء', style: 'cancel' },
                  { text: 'إزالة', style: 'destructive', onPress: () => removeFromWishlist(item.id) },
                ])}
              >
                <Text style={s.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>❤️</Text>
              <Text style={s.emptyTitle}>قائمة الأمنيات فارغة</Text>
              <Text style={s.emptyHint}>أضف المنتجات التي تعجبك لتجدها بسهولة لاحقاً</Text>
            </View>
          }
        />
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
  list: { padding: 8 },
  cardWrap: { flex: 1, padding: 4, position: 'relative' },
  removeBtn: { position: 'absolute', top: 8, right: 8, zIndex: 10, backgroundColor: Colors.white, borderRadius: 12, padding: 2, elevation: 2 },
  removeText: { fontSize: 14 },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
