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

type Notification = { id: number; title: string; body?: string; type?: string; createdAt: string; isRead?: boolean };

const TYPE_ICONS: Record<string, string> = {
  order: '🛍️', wallet: '💳', promo: '🎉', system: '🔔', support: '💬', default: '📢',
};

export default function NotificationsScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { data: notifs, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet<Notification[]>('/api/notifications'),
    refetchInterval: 30000,
  });

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
          <Text style={s.backArrow}>→</Text>
        </TouchableOpacity>
        <Text style={s.title}>الإشعارات</Text>
        <View style={{ width: 36 }} />
      </View>
      {isLoading ? <Loading /> : (
        <FlatList
          data={notifs}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <View style={[s.card, !item.isRead && s.cardUnread]}>
              <Text style={s.notifIcon}>{TYPE_ICONS[item.type || 'default'] || TYPE_ICONS.default}</Text>
              <View style={s.notifContent}>
                <Text style={s.notifTitle}>{item.title}</Text>
                {item.body && <Text style={s.notifBody}>{item.body}</Text>}
                <Text style={s.notifDate}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
              </View>
              {!item.isRead && <View style={s.unreadDot} />}
            </View>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🔔</Text>
              <Text style={s.emptyText}>لا توجد إشعارات</Text>
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
  list: { padding: 12, gap: 8 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14,
    borderWidth: 1, borderColor: Colors.border, position: 'relative',
  },
  cardUnread: { backgroundColor: Colors.pink50, borderColor: Colors.primaryLight },
  notifIcon: { fontSize: 24 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, textAlign: 'right', marginBottom: 4 },
  notifBody: { fontSize: 13, color: Colors.textSecondary, textAlign: 'right', marginBottom: 4 },
  notifDate: { fontSize: 11, color: Colors.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
