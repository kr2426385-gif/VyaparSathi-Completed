import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { mobileApi } from '../services/api';

export default function SchemesScreen() {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    mobileApi.getSchemes().then(setSchemes);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Government Scheme Matching</Text>
        <Text style={styles.subtitle}>Verified Credit-Linked Subsidies for Maharashtra MSMEs</Text>

        {schemes.map((s, idx) => (
          <View key={s.id || idx} style={styles.schemeCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.badge}>GOVERNMENT BACKED</Text>
              <Text style={styles.subPill}>35% Max Subsidy</Text>
            </View>
            <Text style={styles.schemeName}>{s.name}</Text>
            <Text style={styles.schemeDesc}>{s.subsidy || 'Credit-linked capital subsidy for plant and machinery.'}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#0b2545' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 14 },
  schemeCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  badge: { fontSize: 9, fontWeight: '800', color: '#0b2545', backgroundColor: '#e0f2fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  subPill: { fontSize: 9, fontWeight: '800', color: '#15803d', backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  schemeName: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  schemeDesc: { fontSize: 11, color: '#475569', marginTop: 4, lineHeight: 16 }
});
