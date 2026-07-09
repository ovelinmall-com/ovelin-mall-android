import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';

type Product = {
  id: number; name: string; price: string | number;
  description?: string; category: string; imageUrl?: string;
  targetInfoLabel?: string; requiresTargetInfo?: boolean;
};

export default function ProductScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { id } = route.params as { id: number };
  const { user } = useAuth();
  const qc = useQueryClient();

  const [targetInfo, setTargetInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashPrice, setFlashPrice] = useState<number | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiGet<Product>(`/api/catalog/products/${id}`),
  });

  useEffect(() => {
    if (id) {
      apiGet<any[]>('/api/flash-sales/active')
        .then(rows => {
          const row = (rows || []).find((r: any) => r.productId === id);
          if (row) setFlashPrice(Number(row.price) * (100 - row.discountPct) / 100);
        })
        .catch(() => {});
    }
  }, [id]);

  const effectivePrice = flashPrice ?? Number(product?.price ?? 0);

  async function handleOrder() {
    if (!user) { nav.navigate('Login'); return; }
    if (product?.requiresTargetInfo && !targetInfo.trim()) {
      setError('يرجى إدخال معلومات الاستهداف');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiPost('/api/orders', {
        productId: id,
        targetInfo: targetInfo.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      Alert.alert('✅ تم الطلب', 'تم تقديم طلبك بنجاح! سيتم تنفيذه قريباً.', [
        { text: 'موافق', onPress: () => nav.navigate('Main', { screen: 'Orders' }) },
      ]);
    } catch (e: any) {
      setError(e.message || 'فشل تقديم الطلب');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <Loading />;
  if (!product) return (
    <View style={s.center}><Text style={s.notFound}>المنتج غير موجود</Text></View>
  );

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
          <Text style={s.backArrow}>→</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{product.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={s.imageWrap}>
          {product.imageUrl ? (
            <Image
              source={{ uri: `https://ovelinmall-ovelin-mall.hf.space${product.imageUrl}` }}
              style={s.image}
              resizeMode="contain"
            />
          ) : (
            <View style={s.imagePlaceholder}>
              <Text style={{ fontSize: 64 }}>🛍️</Text>
            </View>
          )}
          {flashPrice && (
            <View style={s.flashBadge}>
              <Text style={s.flashBadgeText}>⚡ عرض مميز</Text>
            </View>
          )}
        </View>

        <View style={s.content}>
          <Text style={s.productName}>{product.name}</Text>

          <View style={s.priceRow}>
            <Text style={s.price}>{effectivePrice.toFixed(2)} SDG</Text>
            {flashPrice && (
              <Text style={s.originalPrice}>{Number(product.price).toFixed(2)} SDG</Text>
            )}
          </View>

          {/* Trust badges */}
          <View style={s.badges}>
            {[
              { icon: '⚡', text: 'تسليم فوري' },
              { icon: '🔒', text: 'دفع آمن' },
              { icon: '✅', text: 'جودة مضمونة' },
            ].map(b => (
              <View key={b.text} style={s.badge}>
                <Text style={s.badgeIcon}>{b.icon}</Text>
                <Text style={s.badgeText}>{b.text}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {product.description && (
            <View style={s.descBox}>
              <Text style={s.descTitle}>وصف الخدمة</Text>
              <Text style={s.desc}>{product.description}</Text>
            </View>
          )}

          {/* Target info */}
          <View style={s.orderSection}>
            <Text style={s.orderTitle}>تفاصيل الطلب</Text>

            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <Text style={s.fieldLabel}>
              {product.targetInfoLabel || 'رابط الملف أو معلومات الحساب'}
              {product.requiresTargetInfo ? ' *' : ''}
            </Text>
            <TextInput
              style={s.input}
              value={targetInfo}
              onChangeText={setTargetInfo}
              placeholder="أدخل المعلومات المطلوبة..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              textAlign="right"
              textAlignVertical="top"
            />

            <Text style={s.fieldLabel}>ملاحظات (اختياري)</Text>
            <TextInput
              style={s.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="أضف ملاحظات إضافية..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlign="right"
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Order Button */}
      <View style={[s.orderBar, { paddingBottom: insets.bottom + 8 }]}>
        <View>
          <Text style={s.totalLabel}>إجمالي الطلب</Text>
          <Text style={s.totalPrice}>{effectivePrice.toFixed(2)} SDG</Text>
        </View>
        <TouchableOpacity
          style={[s.orderBtn, loading && s.orderBtnDisabled]}
          onPress={handleOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.orderBtnText}>🛒 اطلب الآن</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, color: Colors.textMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.pink50, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: Colors.primary },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center', marginHorizontal: 8 },
  imageWrap: { width: '100%', height: 240, backgroundColor: Colors.pink50, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flashBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#F59E0B', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  flashBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { padding: 16 },
  productName: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'right', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginBottom: 16 },
  price: { fontSize: 26, fontWeight: '900', color: Colors.primary },
  originalPrice: { fontSize: 16, color: Colors.textMuted, textDecorationLine: 'line-through' },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { flex: 1, backgroundColor: Colors.pink50, borderRadius: 8, padding: 8, alignItems: 'center', gap: 2 },
  badgeIcon: { fontSize: 16 },
  badgeText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  descBox: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  descTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 8, textAlign: 'right' },
  desc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, textAlign: 'right' },
  orderSection: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  orderTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12, textAlign: 'right' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: Colors.error, fontSize: 13, textAlign: 'right' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: Colors.surface, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, minHeight: 60 },
  orderBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, elevation: 8,
  },
  totalLabel: { fontSize: 12, color: Colors.textMuted },
  totalPrice: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  orderBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, elevation: 3 },
  orderBtnDisabled: { opacity: 0.7 },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
