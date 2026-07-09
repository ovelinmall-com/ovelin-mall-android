import React from 'react';
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

type Ticket = {
  id: number; subject: string; status: string; createdAt: string;
  lastMessage?: string; unreadCount?: number;
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open:     { label: 'مفتوحة',   color: '#3B82F6', bg: '#DBEAFE' },
  answered: { label: 'مُجاب',    color: '#10B981', bg: '#D1FAE5' },
  closed:   { label: 'مغلوقة',  color: '#6B7280', bg: '#F3F4F6' },
  pending:  { label: 'انتظار',   color: '#F59E0B', bg: '#FEF3C7' },
};

export default function SupportScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => apiGet<Ticket[]>('/api/support'),
    enabled: !!user,
    refetchInterval: 15000,
  });

  if (!user) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <Text style={s.notLoggedText}>سجّل الدخول لرؤية التذاكر</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => nav.navigate('Login')}>
          <Text style={s.loginBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.newBtn} onPress={() => nav.navigate('SupportNew')}>
          <Text style={s.newBtnText}>+ تذكرة جديدة</Text>
        </TouchableOpacity>
        <Text style={s.title}>الدعم الفني</Text>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={tickets}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status] || STATUS_META.open;
            return (
              <TouchableOpacity
                style={s.card}
                onPress={() => nav.navigate('SupportDetail', { id: item.id })}
              >
                <View style={s.cardTop}>
                  <View style={[s.badge, { backgroundColor: meta.bg }]}>
                    <Text style={[s.badgeText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                  <Text style={s.cardId}>#{item.id}</Text>
                </View>
                <Text style={s.subject}>{item.subject}</Text>
                {item.lastMessage && (
                  <Text style={s.lastMsg} numberOfLines={2}>{item.lastMessage}</Text>
                )}
                <View style={s.cardBottom}>
                  <Text style={s.arrow}>←</Text>
                  <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
                </View>
                {item.unreadCount && item.unreadCount > 0 ? (
                  <View style={s.unreadBadge}>
                    <Text style={s.unreadText}>{item.unreadCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>💬</Text>
              <Text style={s.emptyTitle}>لا توجد تذاكر دعم</Text>
              <Text style={s.emptyHint}>اضغط على "+ تذكرة جديدة" لفتح طلب مساعدة</Text>
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
  newBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: 12, gap: 10 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.border, elevation: 1, position: 'relative',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardId: { fontSize: 12, color: Colors.textMuted },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  subject: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'right', marginBottom: 6 },
  lastMsg: { fontSize: 13, color: Colors.textMuted, textAlign: 'right', marginBottom: 8 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: 12, color: Colors.textMuted },
  arrow: { fontSize: 16, color: Colors.textMuted },
  unreadBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: Colors.primary, width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
