import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiPost } from '../api/client';
import { Colors, Radius } from '../theme/colors';

export default function ForgotPasswordScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!email.trim()) { Alert.alert('تنبيه', 'أدخل بريدك الإلكتروني'); return; }
    setLoading(true);
    try {
      await apiPost('/api/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل إرسال الطلب');
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
            <Text style={s.backArrow}>→</Text>
          </TouchableOpacity>
          <Text style={s.title}>نسيت كلمة المرور</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.content}>
          {sent ? (
            <View style={s.successBox}>
              <Text style={s.successIcon}>✅</Text>
              <Text style={s.successTitle}>تم الإرسال!</Text>
              <Text style={s.successText}>تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين</Text>
              <TouchableOpacity style={s.btn} onPress={() => nav.navigate('Login')}>
                <Text style={s.btnText}>العودة لتسجيل الدخول</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.card}>
              <Text style={s.icon}>🔑</Text>
              <Text style={s.desc}>أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور</Text>
              <Text style={s.label}>البريد الإلكتروني</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
              />
              <TouchableOpacity
                style={[s.btn, loading && { opacity: 0.7 }]}
                onPress={submit}
                disabled={loading}
              >
                <Text style={s.btnText}>{loading ? 'جاري الإرسال...' : 'إرسال رابط الاسترداد'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 16 },
  desc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, textAlign: 'right', alignSelf: 'stretch' },
  input: { backgroundColor: Colors.surface, borderRadius: 10, padding: 13, fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border, width: '100%', marginBottom: 16 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', width: '100%' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  successBox: { alignItems: 'center', padding: 24 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  successText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
});
