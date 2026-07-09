import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius, Spacing } from '../theme/colors';
import { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { refresh } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!identifier.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiPost('/api/auth/login', { identifier: identifier.trim(), password });
      await refresh();
      nav.goBack();
    } catch (e: any) {
      setError(e.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>OM</Text>
          </View>
          <Text style={styles.appName}>OVELIN MALL</Text>
          <Text style={styles.tagline}>متجرك الرقمي الأفضل</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>تسجيل الدخول</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>اسم المستخدم أو البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="أدخل اسم المستخدم أو البريد"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              textAlign="right"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="أدخل كلمة المرور"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              textAlign="right"
            />
          </View>

          <TouchableOpacity
            onPress={() => nav.navigate('ForgotPassword')}
            style={styles.forgotWrap}
          >
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => nav.navigate('Register')}
          >
            <Text style={styles.registerBtnText}>إنشاء حساب جديد</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, backgroundColor: Colors.background,
    paddingHorizontal: 20, alignItems: 'center',
  },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, elevation: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  logoText: { fontSize: 24, fontWeight: '900', color: '#fff' },
  appName: { fontSize: 22, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  tagline: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  card: {
    width: '100%', backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: 24, borderWidth: 1, borderColor: Colors.border,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 20 },
  errorBox: {
    backgroundColor: '#FEE2E2', borderRadius: Radius.md, padding: 12, marginBottom: 16,
  },
  errorText: { color: Colors.error, fontSize: 13, textAlign: 'right' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, textAlign: 'right' },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  forgotWrap: { alignItems: 'flex-start', marginBottom: 20 },
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, padding: 16,
    alignItems: 'center', elevation: 3,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: 13 },
  registerBtn: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.md,
    padding: 14, alignItems: 'center',
  },
  registerBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
});
