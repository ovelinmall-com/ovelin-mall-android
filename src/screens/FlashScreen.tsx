import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';

type FlashSale = { id: number; productId: number; price: number; discountPct: number; endsAt: string; product?: { name: string; imageUrl?: string } };

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = React.useState('');
  React.useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('انتهى'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 14 }}>⏰ {remaining}</Text>;
}

export default function FlashScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { data: sales, isLoading, refetch } = useQuery({
    queryKey: ['flash-sales-all'],
    queryFn: () => apiGet<FlashSale[]>('/api/flash-sales/active'),
    refetchInterval: 10000,
  });

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
          <Text style={s.backArrow}>→</Text>
        </TouchableOpacity>
        <Text style={s.title}>⚡ العروض المحدودة</Text>
        <View style={{ width: 36 }} />
      </View>
      {isLoading ? <Loading /> : (
        <FlatList
          data={sales}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => nav.navigate('Product', { id: item.productId })}
            >
              <View style={s.discountBadge}>
                <Text style={s.discountText}>-{item.discountPct}%</Text>
              </View>
              <Text style={s.productName}>{item.product?.name || `منتج #${item.productId}`}</Text>
              <View style={s.priceRow}>
                <Text style={s.price}>{(item.price * (100 - item.discountPct) / 100).toFixed(2)} SDG</Text>
                <Text style={s.originalPrice}>{item.price} SDG</Text>
              </View>
              <CountdownTimer endsAt={item.endsAt} />
              <TouchableOpacity
                style={s.buyBtn}
                onPress={() => nav.navigate('Product', { id: item.productId })}
              >
                <Text style={s.buyBtnText}>اشتري الآن ⚡</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>⚡</Text>
              <Text style={s.emptyTitle}>لا توجد عروض حالية</Text>
              <Text style={s.emptyHint}>تابعنا للحصول على أفضل العروض والخصومات</Text>
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
  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 16,
    borderWidth: 2, borderColor: '#FDE68A', position: 'relative', elevation: 2,
  },
  discountBadge: {
    position: 'absolute', top: -10, right: 16,
    backgroundColor: '#F59E0B', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  discountText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  productName: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'right', marginTop: 10, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'flex-end', marginBottom: 8 },
  price: { fontSize: 22, fontWeight: '900', color: Colors.primary },
  originalPrice: { fontSize: 14, color: Colors.textMuted, textDecorationLine: 'line-through' },
  buyBtn: { backgroundColor: '#F59E0B', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 10 },
  buyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
