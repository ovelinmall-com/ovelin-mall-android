import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, FlatList, RefreshControl, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { RootStackParamList } from '../navigation';
import { Colors, Spacing, Radius } from '../theme/colors';
import { ProductCard, Product } from '../components/ProductCard';
import { Loading } from '../components/Loading';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Category = { slug: string; name: string; icon?: string };
type StatsOverview = { totalOrders?: number; totalProducts?: number; totalUsers?: number };

const CATEGORY_ICONS: Record<string, string> = {
  pubg: '🎮', games: '🕹️', social: '📱', streaming: '🎬',
  gift: '🎁', crypto: '₿', smm: '📊', subscriptions: '💎',
  cards: '🃏', topup: '⚡', default: '🛍️',
};

const HERO_SLIDES = [
  { title: 'أرقى الخدمات الرقمية', sub: 'بأفضل الأسعار وأسرع تسليم', emoji: '✨', color: '#FF0055' },
  { title: 'خدمات أحبّها العملاء', sub: 'آلاف الطلبات المكتملة', emoji: '🔥', color: '#E0004C' },
  { title: 'خصومات حصرية', sub: 'وفّر حتى 60% لفترة محدودة', emoji: '⚡', color: '#CC0044' },
];

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [heroIndex, setHeroIndex] = useState(0);
  const [search, setSearch] = useState('');

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/api/catalog/categories'),
  });

  const { data: products, isLoading: prodLoading, refetch } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => apiGet<Product[]>('/api/catalog/products?limit=20'),
  });

  const { data: flashSales } = useQuery({
    queryKey: ['flash-sales'],
    queryFn: () => apiGet<any[]>('/api/flash-sales/active').catch(() => []),
  });

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const filteredProducts = search
    ? (products || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const slide = HERO_SLIDES[heroIndex];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>OVELIN MALL</Text>
          <Text style={styles.tagline}>متجرك الرقمي الأفضل</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => nav.navigate('Notifications')}
        >
          <Text style={{ fontSize: 22 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={prodLoading} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        {/* Search */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍  ابحث عن خدمة..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
        </View>

        {/* Hero Banner */}
        <View style={[styles.hero, { backgroundColor: slide.color }]}>
          <Text style={styles.heroEmoji}>{slide.emoji}</Text>
          <Text style={styles.heroTitle}>{slide.title}</Text>
          <Text style={styles.heroSub}>{slide.sub}</Text>
          <View style={styles.heroDots}>
            {HERO_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.heroDot, i === heroIndex && styles.heroDotActive]}
              />
            ))}
          </View>
        </View>

        {/* Flash Sales Banner */}
        {flashSales && flashSales.length > 0 && (
          <TouchableOpacity
            style={styles.flashBanner}
            onPress={() => nav.navigate('Flash')}
          >
            <Text style={styles.flashText}>⚡ عروض محدودة الوقت — تسوّق الآن!</Text>
          </TouchableOpacity>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>التصنيفات</Text>
            <TouchableOpacity onPress={() => nav.navigate('Main', { screen: 'Orders' } as any)}>
              <Text style={styles.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          {catLoading ? (
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(categories || []).map(cat => (
                <TouchableOpacity
                  key={cat.slug}
                  style={styles.catCard}
                  onPress={() => nav.navigate('Category', { slug: cat.slug, name: cat.name })}
                >
                  <View style={styles.catIcon}>
                    <Text style={{ fontSize: 24 }}>
                      {CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default}
                    </Text>
                  </View>
                  <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Products Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المنتجات المميزة</Text>
          {prodLoading ? (
            <Loading />
          ) : (
            <View style={styles.productsGrid}>
              {(filteredProducts || []).map(p => (
                <View key={p.id} style={styles.productWrap}>
                  <ProductCard
                    product={p}
                    onPress={() => nav.navigate('Product', { id: p.id })}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: '⚡', title: 'تسليم فوري', sub: 'خلال دقائق' },
            { icon: '🔒', title: 'دفع آمن', sub: 'مشفر ومحمي' },
            { icon: '🌟', title: 'جودة عالية', sub: 'خدمات معتمدة' },
          ].map(f => (
            <View key={f.title} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureSub}>{f.sub}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logo: { fontSize: 20, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  tagline: { fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.pink50, alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: { margin: 12 },
  searchInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    borderWidth: 1, borderColor: Colors.border, color: Colors.text,
  },
  hero: {
    marginHorizontal: 12, borderRadius: Radius.xl, padding: 24,
    alignItems: 'center', marginBottom: 12,
  },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  heroDots: { flexDirection: 'row', marginTop: 12, gap: 6 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  heroDotActive: { backgroundColor: '#fff', width: 18 },
  flashBanner: {
    marginHorizontal: 12, marginBottom: 12,
    backgroundColor: '#FFF3CD', borderRadius: Radius.md,
    padding: 12, borderLeftWidth: 4, borderLeftColor: '#F59E0B',
  },
  flashText: { color: '#92400E', fontWeight: '700', fontSize: 14, textAlign: 'right' },
  section: { paddingHorizontal: 12, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  loadingText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', padding: 12 },
  catCard: {
    alignItems: 'center', marginLeft: 10, width: 72,
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: 10, borderWidth: 1, borderColor: Colors.border, elevation: 1,
  },
  catIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.pink50, alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  catName: { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  productWrap: { width: '50%', padding: 4 },
  features: {
    flexDirection: 'row', marginHorizontal: 12, gap: 8, marginBottom: 8,
  },
  featureItem: {
    flex: 1, backgroundColor: Colors.pink50, borderRadius: Radius.md,
    padding: 12, alignItems: 'center',
  },
  featureIcon: { fontSize: 22, marginBottom: 4 },
  featureTitle: { fontSize: 12, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  featureSub: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
});
