import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Share, FlatList, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';

type ReferralInfo = {
  referralCode: string; totalReferrals?: number; totalEarned?: string; pendingEarned?: string;
  referrals?: Array<{ id: number; username: string; createdAt: string; earned?: string }>;
};

export default function ReferralsScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => apiGet<ReferralInfo>('/api/referrals'),
    enabled: !!user,
  });

  async function shareCode() {
    try {
      await Share.share({
        message: `انضم لـ Ovelin Mall وتسوّق الخدمات الرقمية بأفضل الأسعار! استخدم كودي: ${data?.referralCode || user?.referralCode}\nhttps://ovelinmall-ovelin-mall.hf.space`,
        title: 'Ovelin Mall - كود الإحالة',
      });
    } catch {}
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
          <Text style={s.backArrow}>→</Text>
        </TouchableOpacity>
        <Text style={s.title}>برنامج الإحالة</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? <Loading /> : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {/* Hero */}
          <View style={s.hero}>
            <Text style={s.heroIcon}>🎁</Text>
            <Text style={s.heroTitle}>ادعُ أصدقاءك واكسب!</Text>
            <Text style={s.heroSub}>احصل على مكافأة لكل صديق ينضم بكودك</Text>
          </View>

          {/* Code */}
          <View style={s.codeCard}>
            <Text style={s.codeLabel}>كودك الخاص</Text>
            <Text style={s.code}>{data?.referralCode || user?.referralCode}</Text>
            <TouchableOpacity style={s.shareBtn} onPress={shareCode}>
              <Text style={s.shareBtnText}>📤 مشاركة الكود</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statValue}>{data?.totalReferrals ?? 0}</Text>
              <Text style={s.statLabel}>الأصدقاء</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statValue}>{Number(data?.totalEarned ?? 0).toFixed(2)}</Text>
              <Text style={s.statLabel}>إجمالي المكاسب SDG</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statValue}>{Number(data?.pendingEarned ?? 0).toFixed(2)}</Text>
              <Text style={s.statLabel}>في الانتظار SDG</Text>
            </View>
          </View>

          {/* How it works */}
          <View style={s.howCard}>
            <Text style={s.howTitle}>كيف يعمل البرنامج؟</Text>
            {[
              { step: '1', text: 'شارك كودك الخاص مع أصدقائك' },
              { step: '2', text: 'يسجّل صديقك بكودك وينضم للمتجر' },
              { step: '3', text: 'تحصل على مكافأة فور إجراء صديقك أول طلب' },
            ].map(item => (
              <View key={item.step} style={s.howStep}>
                <Text style={s.howStepText}>{item.text}</Text>
                <View style={s.howStepNum}>
                  <Text style={s.howStepNumText}>{item.step}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Referrals List */}
          {data?.referrals && data.referrals.length > 0 && (
            <View style={s.listSection}>
              <Text style={s.listTitle}>الأصدقاء المدعوّون</Text>
              {data.referrals.map(r => (
                <View key={r.id} style={s.referralItem}>
                  <View style={s.referralAvatar}>
                    <Text style={s.referralAvatarText}>{r.username.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={s.referralInfo}>
                    <Text style={s.referralName}>{r.username}</Text>
                    <Text style={s.referralDate}>{new Date(r.createdAt).toLocaleDateString('ar-EG')}</Text>
                  </View>
                  {r.earned && <Text style={s.referralEarned}>+{Number(r.earned).toFixed(2)} SDG</Text>}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
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
  hero: {
    backgroundColor: Colors.primary, margin: 12, borderRadius: Radius.xl,
    padding: 28, alignItems: 'center',
  },
  heroIcon: { fontSize: 44, marginBottom: 10 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  codeCard: {
    margin: 12, backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: 20, alignItems: 'center', borderWidth: 2, borderColor: Colors.primary,
  },
  codeLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 8 },
  code: { fontSize: 32, fontWeight: '900', color: Colors.primary, letterSpacing: 6, marginBottom: 16 },
  shareBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  shareBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  statsRow: { flexDirection: 'row', marginHorizontal: 12, gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  howCard: { margin: 12, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.border },
  howTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, textAlign: 'right', marginBottom: 12 },
  howStep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  howStepText: { flex: 1, fontSize: 13, color: Colors.textSecondary, textAlign: 'right' },
  howStepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  howStepNumText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  listSection: { marginHorizontal: 12 },
  listTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, textAlign: 'right', marginBottom: 10 },
  referralItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, padding: 12, borderRadius: Radius.md, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  referralAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.pink50, alignItems: 'center', justifyContent: 'center' },
  referralAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  referralInfo: { flex: 1 },
  referralName: { fontSize: 14, fontWeight: '700', color: Colors.text, textAlign: 'right' },
  referralDate: { fontSize: 11, color: Colors.textMuted },
  referralEarned: { fontSize: 14, fontWeight: '800', color: Colors.success },
});
