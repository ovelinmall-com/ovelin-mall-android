import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, Alert, TextInput, Modal, Image, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';

type Transaction = {
  id: number; type: string; amount: string;
  description?: string; createdAt: string; status?: string;
};

type WalletData = { balance: string; cashbackBalance?: string; totalDeposited?: string; totalSpent?: string };

const PAYMENT_METHODS = [
  { id: 'MyCashi', label: 'ماي كاشي', account: '300332654', owner: 'معاذ عبد اللطيف', icon: '💜' },
  { id: 'OCash', label: 'أوكاش', account: '1666104', owner: 'معاذ عبد اللطيف', icon: '💚' },
  { id: 'BinancePay', label: 'بايننس باي', account: '1167049074', owner: 'Ovelin Mall', icon: '💛' },
];

const TX_ICONS: Record<string, string> = {
  deposit: '⬆️', withdrawal: '⬇️', order: '🛍️', refund: '↩️',
  transfer: '↔️', cashback: '🎁', bonus: '⭐', default: '💳',
};

export default function WalletScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showDeposit, setShowDeposit] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [amount, setAmount] = useState('');
  const [txRef, setTxRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const { data: wallet, isLoading: wLoading, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiGet<WalletData>('/api/wallet'),
    enabled: !!user,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => apiGet<Transaction[]>('/api/wallet/transactions'),
    enabled: !!user,
  });

  async function submitDeposit() {
    if (!amount || Number(amount) <= 0) { Alert.alert('خطأ', 'أدخل مبلغاً صحيحاً'); return; }
    if (!txRef.trim()) { Alert.alert('خطأ', 'أدخل رقم العملية'); return; }
    setSubmitting(true);
    try {
      await apiPost('/api/wallet/deposit', {
        method: selectedMethod.id,
        amount: Number(amount),
        transactionRef: txRef.trim(),
      });
      setShowDeposit(false);
      setAmount('');
      setTxRef('');
      qc.invalidateQueries({ queryKey: ['wallet'] });
      Alert.alert('✅ تم الإرسال', 'سيتم مراجعة طلب الإيداع وتأكيده قريباً');
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <Text style={s.notLoggedText}>سجّل الدخول للوصول للمحفظة</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => nav.navigate('Login')}>
          <Text style={s.loginBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>المحفظة</Text>
        <TouchableOpacity onPress={() => nav.navigate('Transfers')}>
          <Text style={s.transferLink}>↔️ تحويل</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={wLoading} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Balance Card */}
        <View style={s.balanceCard}>
          <View style={s.balanceRow}>
            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
              <Text style={s.eyeIcon}>{hideBalance ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
            <Text style={s.balanceLabel}>الرصيد الحالي</Text>
          </View>
          <Text style={s.balanceAmount}>
            {hideBalance ? '••••••' : `${Number(wallet?.balance ?? 0).toFixed(2)} SDG`}
          </Text>
          {wallet?.cashbackBalance && Number(wallet.cashbackBalance) > 0 && (
            <Text style={s.cashback}>🎁 كاشباك: {Number(wallet.cashbackBalance).toFixed(2)} SDG</Text>
          )}
          <TouchableOpacity style={s.depositBtn} onPress={() => setShowDeposit(true)}>
            <Text style={s.depositBtnText}>⬆️ إيداع رصيد</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statIcon}>📥</Text>
            <Text style={s.statValue}>{Number(wallet?.totalDeposited ?? 0).toFixed(0)}</Text>
            <Text style={s.statLabel}>إجمالي الإيداع</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statIcon}>🛍️</Text>
            <Text style={s.statValue}>{Number(wallet?.totalSpent ?? 0).toFixed(0)}</Text>
            <Text style={s.statLabel}>إجمالي الإنفاق</Text>
          </View>
        </View>

        {/* Transactions */}
        <Text style={s.txTitle}>سجل المعاملات</Text>
        {txLoading ? <Loading /> : (
          <>
            {(transactions || []).length === 0 ? (
              <View style={s.emptyTx}>
                <Text style={s.emptyTxIcon}>📭</Text>
                <Text style={s.emptyTxText}>لا توجد معاملات بعد</Text>
              </View>
            ) : (
              (transactions || []).map(tx => (
                <View key={tx.id} style={s.txItem}>
                  <View style={s.txLeft}>
                    <Text style={s.txDate}>{new Date(tx.createdAt).toLocaleDateString('ar-EG')}</Text>
                    <Text style={s.txDesc} numberOfLines={1}>{tx.description || tx.type}</Text>
                  </View>
                  <View style={s.txRight}>
                    <Text style={s.txIcon}>{TX_ICONS[tx.type] || TX_ICONS.default}</Text>
                    <Text style={[
                      s.txAmount,
                      { color: tx.type === 'deposit' || tx.type === 'refund' || tx.type === 'cashback' ? Colors.success : Colors.error }
                    ]}>
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}{Number(tx.amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Deposit Modal */}
      <Modal visible={showDeposit} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>إيداع رصيد</Text>
            <TouchableOpacity style={s.modalClose} onPress={() => setShowDeposit(false)}>
              <Text style={s.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={s.modalLabel}>اختر طريقة الدفع</Text>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[s.methodCard, selectedMethod.id === m.id && s.methodCardActive]}
                onPress={() => setSelectedMethod(m)}
              >
                <Text style={s.methodIcon}>{m.icon}</Text>
                <View style={s.methodInfo}>
                  <Text style={s.methodLabel}>{m.label}</Text>
                  <Text style={s.methodAccount}>{m.account} — {m.owner}</Text>
                </View>
                {selectedMethod.id === m.id && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}

            <Text style={s.modalLabel}>المبلغ (SDG)</Text>
            <TextInput
              style={s.modalInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="أدخل المبلغ"
              keyboardType="numeric"
              textAlign="right"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={s.modalLabel}>رقم العملية / المرجع</Text>
            <TextInput
              style={s.modalInput}
              value={txRef}
              onChangeText={setTxRef}
              placeholder="أدخل رقم العملية"
              textAlign="right"
              placeholderTextColor={Colors.textMuted}
            />

            <TouchableOpacity
              style={[s.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={submitDeposit}
              disabled={submitting}
            >
              <Text style={s.submitBtnText}>{submitting ? 'جاري الإرسال...' : 'إرسال طلب الإيداع'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  transferLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  balanceCard: {
    margin: 12, backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: 24,
    alignItems: 'center', elevation: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  eyeIcon: { fontSize: 18 },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 8 },
  cashback: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  depositBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  depositBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  txTitle: { paddingHorizontal: 16, paddingBottom: 8, fontSize: 16, fontWeight: '800', color: Colors.text },
  emptyTx: { alignItems: 'center', padding: 32 },
  emptyTxIcon: { fontSize: 40, marginBottom: 8 },
  emptyTxText: { color: Colors.textMuted, fontSize: 14 },
  txItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white,
  },
  txLeft: { flex: 1 },
  txDate: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  txDesc: { fontSize: 14, fontWeight: '600', color: Colors.text, textAlign: 'right' },
  txRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  txIcon: { fontSize: 18 },
  txAmount: { fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, position: 'relative',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 20 },
  modalClose: { position: 'absolute', top: 20, left: 20 },
  modalCloseText: { fontSize: 20, color: Colors.textMuted },
  modalLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textAlign: 'right' },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8, gap: 10,
  },
  methodCardActive: { borderColor: Colors.primary, backgroundColor: Colors.pink50 },
  methodIcon: { fontSize: 24 },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 14, fontWeight: '700', color: Colors.text, textAlign: 'right' },
  methodAccount: { fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  modalInput: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 12, fontSize: 15,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
