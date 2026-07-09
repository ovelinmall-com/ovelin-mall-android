import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { apiPost, apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius } from '../theme/colors';

type Transfer = { id: number; toUsername?: string; fromUsername?: string; amount: string; type: string; createdAt: string };

export default function TransfersScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: history } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => apiGet<Transfer[]>('/api/transfers'),
    enabled: !!user,
  });

  async function doTransfer() {
    if (!recipient.trim()) { Alert.alert('تنبيه', 'أدخل اسم المستخدم المستلم'); return; }
    if (!amount || Number(amount) <= 0) { Alert.alert('تنبيه', 'أدخل مبلغاً صحيحاً'); return; }
    Alert.alert(
      'تأكيد التحويل',
      `تحويل ${amount} SDG إلى ${recipient}?`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد', onPress: async () => {
            setLoading(true);
            try {
              await apiPost('/api/transfers', { toUsername: recipient.trim(), amount: Number(amount), note: note.trim() });
              qc.invalidateQueries({ queryKey: ['wallet'] });
              qc.invalidateQueries({ queryKey: ['transfers'] });
              setRecipient(''); setAmount(''); setNote('');
              Alert.alert('✅ تم التحويل', `تم تحويل ${amount} SDG بنجاح`);
            } catch (e: any) {
              Alert.alert('خطأ', e.message || 'فشل التحويل');
            } finally { setLoading(false); }
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
            <Text style={s.backArrow}>→</Text>
          </TouchableOpacity>
          <Text style={s.title}>التحويلات</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.card}>
            <Text style={s.cardTitle}>تحويل رصيد</Text>
            <Text style={s.label}>اسم المستخدم المستلم</Text>
            <TextInput style={s.input} value={recipient} onChangeText={setRecipient} placeholder="أدخل اسم المستخدم" placeholderTextColor={Colors.textMuted} autoCapitalize="none" textAlign="right" />
            <Text style={s.label}>المبلغ (SDG)</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" placeholderTextColor={Colors.textMuted} textAlign="right" />
            <Text style={s.label}>ملاحظة (اختياري)</Text>
            <TextInput style={s.input} value={note} onChangeText={setNote} placeholder="سبب التحويل..." placeholderTextColor={Colors.textMuted} textAlign="right" />
            <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={doTransfer} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>↔️ إرسال التحويل</Text>}
            </TouchableOpacity>
          </View>

          {history && history.length > 0 && (
            <View style={s.histSection}>
              <Text style={s.histTitle}>سجل التحويلات</Text>
              {history.map(t => (
                <View key={t.id} style={s.histItem}>
                  <Text style={s.histIcon}>{t.type === 'sent' ? '⬆️' : '⬇️'}</Text>
                  <View style={s.histInfo}>
                    <Text style={s.histUser}>{t.type === 'sent' ? `إلى: ${t.toUsername}` : `من: ${t.fromUsername}`}</Text>
                    <Text style={s.histDate}>{new Date(t.createdAt).toLocaleDateString('ar-EG')}</Text>
                  </View>
                  <Text style={[s.histAmount, { color: t.type === 'sent' ? Colors.error : Colors.success }]}>
                    {t.type === 'sent' ? '-' : '+'}{Number(t.amount).toFixed(2)} SDG
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 20, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: Colors.surface, borderRadius: 10, padding: 13, fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  histSection: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.border },
  histTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, textAlign: 'right', marginBottom: 12 },
  histItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  histIcon: { fontSize: 22 },
  histInfo: { flex: 1 },
  histUser: { fontSize: 13, fontWeight: '600', color: Colors.text, textAlign: 'right' },
  histDate: { fontSize: 11, color: Colors.textMuted },
  histAmount: { fontSize: 15, fontWeight: '800' },
});
