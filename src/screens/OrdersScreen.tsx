import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';

type Order = {
  id: number; status: string; totalPrice: string; productName?: string;
  product?: { name: string }; createdAt: string; targetInfo?: string;
};

const STATUS = {
  pending:    { label: 'قيد الانتظار', color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
  processing: { label: 'قيد التنفيذ',  color: '#3B82F6', bg: '#DBEAFE', icon: '⚙️' },
  completed:  { label: 'مكتمل',        color: '#10B981', bg: '#D1FAE5', icon: '✅' },
  cancelled:  { label: 'ملغي',         color: '#EF4444', bg: '#FEE2E2', icon: '❌' },
  rejected:   { label: 'مرفوض',        color: '#EF4444', bg: '#FEE2E2', icon: '🚫' },
  partial:    { label: 'جزئي',         color: '#F97316', bg: '#FFEDD5', icon: '⚡' },
};

const TABS = ['all', 'pending', 'processing', 'completed', 'cancelled'];
const TAB_LABELS: Record<string, string> = {
  all: 'الكل', pending: 'انتظار', processing: 'تنفيذ', completed: 'مكتمل', cancelled: 'ملغي',
};

export default function OrdersScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState('all');

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiGet<Order[]>('/api/orders'),
    enabled: !!user,
    refetchInterval: 10000,
  });

  const filtered = useMemo(() =>
    tab === 'all' ? (orders || []) : (orders || []).filter(o => o.status === tab),
    [orders, tab]
  );

  if (!user) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <Text style={s.notLoggedText}>سجّل الدخول لرؤية طلباتك</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => nav.navigate('Login')}>
          <Text style={s.loginBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>طلباتي</Text>
        <Text style={s.count}>{orders?.length ?? 0} طلب</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && s.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {TAB_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
          renderItem={({ item }) => {
            const meta = STATUS[item.status as keyof typeof STATUS] || STATUS.pending;
            const name = item.productName || item.product?.name || 'خدمة';
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <Text style={s.cardId}>طلب #{item.id}</Text>
                  <View style={[s.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={{ fontSize: 12 }}>{meta.icon}</Text>
                    <Text style={[s.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
                <Text style={s.cardName}>{name}</Text>
                <View style={s.cardBottom}>
                  <Text style={s.cardDate}>
                    {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                  </Text>
                  <Text style={s.cardPrice}>{Number(item.totalPrice).toFixed(2)} SDG</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🛍️</Text>
              <Text style={s.emptyText}>لا توجد طلبات</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notLoggedText: { fontSize: 16, color: Colors.textMuted, marginBottom: 20 },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  count: { fontSize: 14, color: Colors.textMuted },
  tabs: { flexDirection: 'row', backgroundColor: Colors.white, paddingHorizontal: 8, paddingVertical: 8, gap: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.pink50 },
  tabText: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  list: { padding: 12, gap: 10 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.border, elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardId: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardName: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'right', marginBottom: 10 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { fontSize: 12, color: Colors.textMuted },
  cardPrice: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
