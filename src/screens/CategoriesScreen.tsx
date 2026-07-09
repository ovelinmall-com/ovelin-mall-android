import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';

type Category = { slug: string; name: string; productCount?: number };

const ICONS: Record<string, string> = {
  pubg: '🎮', games: '🕹️', social: '📱', streaming: '🎬',
  gift: '🎁', crypto: '₿', smm: '📊', subscriptions: '💎',
  cards: '🃏', topup: '⚡', 'gift-cards': '🎁',
  default: '🛍️',
};

const COLORS = [
  '#FF0055', '#7C3AED', '#059669', '#2563EB', '#D97706',
  '#DC2626', '#0891B2', '#9333EA', '#16A34A', '#EA580C',
];

export default function CategoriesScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/api/catalog/categories'),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorView message="فشل تحميل التصنيفات" onRetry={refetch} />;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>التصنيفات</Text>
        <Text style={s.count}>{categories?.length ?? 0} تصنيف</Text>
      </View>

      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={item => item.slug}
        contentContainerStyle={s.list}
        renderItem={({ item, index }) => {
          const color = COLORS[index % COLORS.length];
          const icon = ICONS[item.slug] || ICONS.default;
          return (
            <TouchableOpacity
              style={[s.card, { borderTopColor: color, borderTopWidth: 3 }]}
              onPress={() => nav.navigate('Category', { slug: item.slug, name: item.name })}
            >
              <Text style={s.cardIcon}>{icon}</Text>
              <Text style={s.cardName}>{item.name}</Text>
              {item.productCount !== undefined && (
                <Text style={[s.cardCount, { color }]}>{item.productCount} منتج</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  count: { fontSize: 13, color: Colors.textMuted },
  list: { padding: 8 },
  card: {
    flex: 1, margin: 6, backgroundColor: Colors.white,
    borderRadius: Radius.lg, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardIcon: { fontSize: 36, marginBottom: 10 },
  cardName: { fontSize: 14, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 4 },
  cardCount: { fontSize: 12, fontWeight: '600' },
});
