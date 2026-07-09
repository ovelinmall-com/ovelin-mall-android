import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius, Spacing } from '../theme/colors';

type Dashboard = {
  totalOrders?: number;
  completedOrders?: number;
  totalSpent?: string;
  vipLevel?: string;
};

const VIP_COLORS: Record<string, string> = {
  bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700',
  platinum: '#E5E4E2', diamond: '#B9F2FF',
};

export default function AccountScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<Dashboard>('/api/user/dashboard'),
    enabled: !!user,
  });

  async function handleLogout() {
    Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: logout },
    ]);
  }

  if (!user) {
    return (
      <View style={[s.guestContainer, { paddingTop: insets.top }]}>
        <Text style={s.guestIcon}>👤</Text>
        <Text style={s.guestTitle}>لم تسجّل الدخول بعد</Text>
        <Text style={s.guestSub}>سجّل الدخول للوصول لحسابك</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => nav.navigate('Login')}>
          <Text style={s.loginBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.regBtn} onPress={() => nav.navigate('Register')}>
          <Text style={s.regBtnText}>إنشاء حساب جديد</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vip = user.vipLevel || 'bronze';
  const vipColor = VIP_COLORS[vip] || VIP_COLORS.bronze;

  const menuItems = [
    { icon: '🛍️', label: 'طلباتي', onPress: () => nav.navigate('Main', { screen: 'Orders' }) },
    { icon: '💳', label: 'محفظتي', onPress: () => nav.navigate('Main', { screen: 'Wallet' }) },
    { icon: '❤️', label: 'قائمة الأمنيات', onPress: () => nav.navigate('Wishlist') },
    { icon: '🤝', label: 'برنامج الإحالة', onPress: () => nav.navigate('Referrals') },
    { icon: '↔️', label: 'التحويلات', onPress: () => nav.navigate('Transfers') },
    { icon: '💬', label: 'الدعم الفني', onPress: () => nav.navigate('Main', { screen: 'Support' }) },
    { icon: '🔔', label: 'الإشعارات', onPress: () => nav.navigate('Notifications') },
    { icon: '⚡', label: 'العروض المحدودة', onPress: () => nav.navigate('Flash') },
  ];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={[s.avatarCircle, { borderColor: vipColor }]}>
            <Text style={s.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={s.username}>{user.username}</Text>
          {user.email && <Text style={s.email}>{user.email}</Text>}
          <View style={[s.vipBadge, { backgroundColor: vipColor + '20', borderColor: vipColor }]}>
            <Text style={[s.vipText, { color: vipColor }]}>
              👑 {vip.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{dashboard?.totalOrders ?? 0}</Text>
            <Text style={s.statLabel}>الطلبات</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{Number(user.balance).toFixed(2)}</Text>
            <Text style={s.statLabel}>الرصيد SDG</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{Number(user.cashbackBalance || 0).toFixed(2)}</Text>
            <Text style={s.statLabel}>الكاشباك</Text>
          </View>
        </View>

        {/* Referral */}
        <View style={s.referralBox}>
          <Text style={s.referralTitle}>🎁 كود الإحالة الخاص بك</Text>
          <Text style={s.referralCode}>{user.referralCode}</Text>
          <Text style={s.referralHint}>شارك الكود واحصل على مكافآت!</Text>
        </View>

        {/* Menu */}
        <View style={s.menu}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.label} style={s.menuItem} onPress={item.onPress}>
              <Text style={s.menuArrow}>←</Text>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuIcon}>{item.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>🚪 تسجيل الخروج</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: Colors.background },
  guestIcon: { fontSize: 64, marginBottom: 16 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  guestSub: { fontSize: 14, color: Colors.textMuted, marginBottom: 32 },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48, marginBottom: 12, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  regBtn: { borderWidth: 2, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, width: '100%', alignItems: 'center' },
  regBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  profileCard: { backgroundColor: Colors.white, padding: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.pink50, alignItems: 'center', justifyContent: 'center', borderWidth: 3, marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  username: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  email: { fontSize: 13, color: Colors.textMuted, marginBottom: 8 },
  vipBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  vipText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  referralBox: { marginHorizontal: 12, marginBottom: 12, backgroundColor: Colors.pink50, borderRadius: Radius.md, padding: 16, alignItems: 'center' },
  referralTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  referralCode: { fontSize: 24, fontWeight: '900', color: Colors.primary, letterSpacing: 4, marginBottom: 4 },
  referralHint: { fontSize: 12, color: Colors.textMuted },
  menu: { marginHorizontal: 12, backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { fontSize: 20, marginLeft: 8 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text, textAlign: 'right' },
  menuArrow: { fontSize: 16, color: Colors.textMuted },
  logoutBtn: { margin: 12, backgroundColor: '#FEE2E2', borderRadius: Radius.md, padding: 16, alignItems: 'center' },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '700' },
});
