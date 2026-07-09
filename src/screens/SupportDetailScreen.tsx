import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius } from '../theme/colors';
import { Loading } from '../components/Loading';

type Message = { id: number; message: string; isAdmin: boolean; createdAt: string };
type Ticket = { id: number; subject: string; status: string; messages?: Message[] };

export default function SupportDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { id } = route.params as { id: number };
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const { data: ticket, isLoading, refetch } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiGet<Ticket>(`/api/support/${id}`),
    refetchInterval: 10000,
  });

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await apiPost(`/api/support/${id}/reply`, { message: reply.trim() });
      setReply('');
      refetch();
    } catch {}
    finally { setSending(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
            <Text style={s.backArrow}>→</Text>
          </TouchableOpacity>
          <Text style={s.title} numberOfLines={1}>{ticket?.subject || 'التذكرة'}</Text>
          <View style={{ width: 36 }} />
        </View>

        {isLoading ? <Loading /> : (
          <FlatList
            ref={listRef}
            data={ticket?.messages || []}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={s.messages}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[s.bubble, item.isAdmin ? s.bubbleAdmin : s.bubbleUser]}>
                <Text style={[s.bubbleText, item.isAdmin ? s.bubbleTextAdmin : s.bubbleTextUser]}>
                  {item.message}
                </Text>
                <Text style={s.bubbleTime}>
                  {item.isAdmin ? '🔧 الدعم' : '👤 أنت'} • {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
          />
        )}

        <View style={[s.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[s.sendBtn, (!reply.trim() || sending) && s.sendBtnDisabled]}
            onPress={sendReply}
            disabled={!reply.trim() || sending}
          >
            <Text style={s.sendIcon}>{sending ? '...' : '📤'}</Text>
          </TouchableOpacity>
          <TextInput
            style={s.replyInput}
            value={reply}
            onChangeText={setReply}
            placeholder="اكتب ردك..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlign="right"
          />
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
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center', marginHorizontal: 8 },
  messages: { padding: 12, gap: 8 },
  bubble: { maxWidth: '80%', borderRadius: Radius.lg, padding: 12 },
  bubbleUser: { backgroundColor: Colors.primary, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleAdmin: { backgroundColor: Colors.white, alignSelf: 'flex-end', borderBottomRightRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAdmin: { color: Colors.text, textAlign: 'right' },
  bubbleTime: { fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: 'right' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 8, gap: 8,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  replyInput: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 10,
    fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border, maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18 },
});
