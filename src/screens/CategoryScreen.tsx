import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { Colors, Radius } from '../theme/colors';
import { ProductCard, Product } from '../components/ProductCard';
import { Loading } from '../components/Loading';

export default function CategoryScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { slug, name } = route.params as { slug: string; name: string };
  const [search, setSearch] = useState('');

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => apiGet<Product[]>(`/api/catalog/products?category=${slug}`),
  });

  const filtered = search
    ? (products || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products || [];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
          <Text style={s.backArrow}>→</Text>
        </TouchableOpacity>
        <Text style={s.title}>{name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.searchWrap}>
        <TextInput
          style={s.search}
          placeholder="🔍  بحث في التصنيف..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Text style={s.countText}>{filtered.length} منتج</Text>
          <FlatList
            data={filtered}
            numColumns={2}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={s.list}
            onRefresh={refetch}
            refreshing={isLoading}
            renderItem={({ item }) => (
              <View style={{ flex: 1, padding: 4 }}>
                <ProductCard
                  product={item}
                  onPress={() => nav.navigate('Product', { id: item.id })}
                />
              </View>
            )}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyIcon}>🛍️</Text>
                <Text style={s.emptyText}>لا توجد منتجات</Text>
              </View>
            }
          />
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
  searchWrap: { padding: 12 },
  search: { backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  countText: { paddingHorizontal: 16, paddingBottom: 4, fontSize: 12, color: Colors.textMuted },
  list: { padding: 8 },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
