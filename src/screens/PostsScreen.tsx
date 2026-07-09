import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, RefreshControl, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';

type Post = {
  id: number; title: string; body?: string; imageUrl?: string;
  createdAt: string; link?: string; isPinned?: boolean;
};

export default function PostsScreen() {
  const insets = useSafeAreaInsets();

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => apiGet<Post[]>('/api/posts'),
    refetchInterval: 60000,
  });

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>الأخبار والمستجدات</Text>
        <Text style={s.subtitle}>آخر التحديثات من Ovelin Mall</Text>
      </View>
      {isLoading ? <Loading /> : (
        <FlatList
          data={posts}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => item.link && Linking.openURL(item.link)}
              activeOpacity={item.link ? 0.8 : 1}
            >
              {item.isPinned && (
                <View style={s.pinnedBadge}>
                  <Text style={s.pinnedText}>📌 مثبّت</Text>
                </View>
              )}
              {item.imageUrl && (
                <Image
                  source={{ uri: `https://ovelinmall-ovelin-mall.hf.space${item.imageUrl}` }}
                  style={s.cardImage}
                  resizeMode="cover"
                />
              )}
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{item.title}</Text>
                {item.body && <Text style={s.cardBody} numberOfLines={4}>{item.body}</Text>}
                <Text style={s.cardDate}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📰</Text>
              <Text style={s.emptyText}>لا توجد أخبار حالياً</Text>
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
    padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'right' },
  subtitle: { fontSize: 13, color: Colors.textMuted, textAlign: 'right', marginTop: 2 },
  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', elevation: 2,
  },
  pinnedBadge: {
    backgroundColor: Colors.pink50, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-end',
  },
  pinnedText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  cardImage: { width: '100%', height: 180 },
  cardContent: { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, textAlign: 'right', marginBottom: 8 },
  cardBody: { fontSize: 13, color: Colors.textSecondary, textAlign: 'right', lineHeight: 20, marginBottom: 8 },
  cardDate: { fontSize: 11, color: Colors.textMuted },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
