import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius } from '../theme/colors';

export default function RegisterScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', referralCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!form.username || !form.email || !form.password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    if (form.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiPost('/api/auth/register', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        referralCode: form.referralCode.trim() || undefined,
      });
      await refresh();
      nav.goBack();
    } catch (e: any) {
      setError(e.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof typeof form, label: string, placeholder: string, opts?: any) => (
    <View style={s.field} key={key}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={form[key]}
        onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        textAlign="right"
        {...opts}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
            <Text style={s.backText}>→</Text>
          </TouchableOpacity>
          <Text style={s.title}>إنشاء حساب</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.card}>
          {error && <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View>}

          {field('username', 'اسم المستخدم *', 'أدخل اسم المستخدم', { autoCapitalize: 'none' })}
          {field('email', 'البريد الإلكتروني *', 'أدخل البريد الإلكتروني', { keyboardType: 'email-address', autoCapitalize: 'none' })}
          {field('password', 'كلمة المرور *', 'أدخل كلمة المرور', { secureTextEntry: true })}
          {field('confirmPassword', 'تأكيد كلمة المرور *', 'أعد إدخال كلمة المرور', { secureTextEntry: true })}
          {field('referralCode', 'كود الإحالة (اختياري)', 'أدخل كود الإحالة إن وجد')}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={s.btnText}>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.loginLink} onPress={() => nav.navigate('Login')}>
            <Text style={s.loginLinkText}>لديك حساب؟ سجّل الدخول</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.pink50, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: Colors.primary },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 20, borderWidth: 1, borderColor: Colors.border, elevation: 2 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: Colors.error, fontSize: 13, textAlign: 'right' },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: Colors.surface, borderRadius: 10, padding: 13, fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink: { alignItems: 'center', marginTop: 16 },
  loginLinkText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
