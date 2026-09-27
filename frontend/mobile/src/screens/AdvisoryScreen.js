import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { mobileApi } from '../services/api';

export default function AdvisoryScreen() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('mr'); // mr, hi, en
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await mobileApi.askAI(query, language);
      setResponse(res);
    } catch (e) {
      setResponse({ answer: 'Advisory offline service active.', suggestedActions: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>VyaparSathi AI Advisor</Text>
          <Text style={styles.subtitle}>Ask in Marathi, Hindi or English</Text>
          
          {/* Language Picker */}
          <View style={styles.langRow}>
            {['mr', 'hi', 'en'].map(l => (
              <TouchableOpacity
                key={l}
                style={[styles.langBtn, language === l && styles.langBtnActive]}
                onPress={() => setLanguage(l)}
              >
                <Text style={[styles.langText, language === l && styles.langTextActive]}>
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input Box */}
        <View style={styles.card}>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder={
              language === 'mr' 
                ? 'उदा. डेअरी व्यवसायासाठी शासकीय अनुदान व कर्ज कसे मिळवावे?' 
                : 'e.g. Which government subsidy is available for dairy processing?'
            }
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity 
            style={styles.askBtn}
            onPress={handleAsk}
            disabled={loading}
          >
            <Text style={styles.askBtnText}>{loading ? 'Consulting Advisor...' : 'Ask VyaparSathi AI'}</Text>
          </TouchableOpacity>
        </View>

        {/* Response Box */}
        {response && (
          <View style={styles.responseCard}>
            <Text style={styles.resLabel}>ADVISORY GUIDANCE</Text>
            <Text style={styles.resText}>{response.answer}</Text>

            {response.suggestedActions?.length > 0 && (
              <View style={styles.actionsBox}>
                <Text style={styles.actionTitle}>Recommended Next Steps:</Text>
                {response.suggestedActions.map((act, i) => (
                  <Text key={i} style={styles.actionItem}>• {act}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#0b2545' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  langRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  langBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e2e8f0' },
  langBtnActive: { backgroundColor: '#0b2545' },
  langText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  langTextActive: { color: '#ffffff' },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  textArea: { fontSize: 13, color: '#0f172a', minHeight: 70, textAlignVertical: 'top' },
  askBtn: { backgroundColor: '#0b2545', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  askBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  responseCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#cbd5e1' },
  resLabel: { fontSize: 10, fontWeight: '800', color: '#0b2545', letterSpacing: 0.5 },
  resText: { fontSize: 13, color: '#1e293b', marginTop: 6, lineHeight: 20, fontWeight: '500' },
  actionsBox: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  actionTitle: { fontSize: 11, fontWeight: '700', color: '#334155' },
  actionItem: { fontSize: 11, color: '#0b2545', marginTop: 4, fontWeight: '600' }
});
