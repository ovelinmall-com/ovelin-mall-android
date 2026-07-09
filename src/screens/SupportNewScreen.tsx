import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../api/client';
import { Colors, Radius } from '../theme/colors';

const CATEGORIES = ['عام', 'مشكلة في طلب', 'إيداع / محفظة', 'حساب', 'مقترح', 'أخرى'];

export default function SupportNewScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    try {
      await apiPost('/api/support', { subject: subject.trim(), message: message.trim(), category });
      qc.invalidateQueries({ queryKey: ['tickets'] });
      Alert.alert('✅ تم الإرسال', 'تم إرسال تذكرتك بنجاح، سيتم الرد قريباً', [
        { text: 'موافق', onPress: () => nav.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل إرسال التذكرة');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
            <Text style={s.backArrow}>→</Text>
          </TouchableOpacity>
          <Text style={s.title}>تذكرة دعم جديدة</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.label}>التصنيف</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.catChip, category === c && s.catChipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[s.catChipText, category === c && s.catChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.label}>الموضوع *</Text>
          <TextInput
            style={s.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="اكتب موضوع التذكرة..."
            placeholderTextColor={Colors.textMuted}
            textAlign="right"
          />

          <Text style={s.label}>الرسالة *</Text>
          <TextInput
            style={[s.input, s.textarea]}
            value={message}
            onChangeText={setMessage}
            placeholder="اشرح مشكلتك أو استفساركم بالتفصيل..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={6}
            textAlign="right"
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={submit}
            disabled={loading}
          >
            <Text style={s.btnText}>{loading ? 'جاري الإرسال...' : '📤 إرسال التذكرة'}</Text>
          </TouchableOpacity>
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
  content: { padding: 16, gap: 4 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, marginTop: 12, textAlign: 'right' },
  catScroll: { marginBottom: 4 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginLeft: 8,
  },
  catChipActive: { backgroundColor: Colors.pink50, borderColor: Colors.primary },
  catChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  catChipTextActive: { color: Colors.primary },
  input: {
    backgroundColor: Colors.white, borderRadius: Radius.md, padding: 13,
    fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  textarea: { minHeight: 120 },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: 16, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
