import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

const JOURNEY_STEPS = [
  { step: '01', title: 'Explore Venture', subtitle: 'Dairy, Turmeric & Rural Processing Ideas', route: 'Business' },
  { step: '02', title: 'Ground Check Market', subtitle: 'APMC Mandis, Kirana demand & wholesale rates', route: 'Market' },
  { step: '03', title: 'Structure Funding', subtitle: 'Capex, Owner Equity & Monthly EMI calculation', route: 'Finance' },
  { step: '04', title: 'Capture Subsidies', subtitle: 'CMEGP (35%), PMFME & MUDRA loan eligibility', route: 'Schemes' },
  { step: '05', title: 'Bank Appraisal Pack', subtitle: '100-Point Bank Readiness Score & DPR generation', route: 'Finance' },
  { step: '06', title: 'Growth & ONDC', subtitle: 'FSSAI compliance, cluster tie-ups & digital buyers', route: 'ONDC' }
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.tagline}>MAHARASHTRA RURAL ENTERPRISE GATEWAY</Text>
          <Text style={styles.title}>VyaparSathi (व्यापारसाथी)</Text>
          <Text style={styles.subtitle}>
            Contextual AI Advisory, Financial Modeling & Government Scheme Matching
          </Text>
        </View>

        {/* Business Decision Sathi Snapshot */}
        <View style={styles.decisionCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Decision Sathi • Multi-Advisor Check</Text>
            <Text style={styles.statusPill}>Caution</Text>
          </View>
          <Text style={styles.decisionTitle}>Dairy & Animal Husbandry (Satara)</Text>
          <Text style={styles.decisionText}>
            Market demand is strong across 12 kirana shops. Ensure 3-phase power or solar chilling backup before capex.
          </Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PROJECT COST</Text>
              <Text style={styles.metricVal}>₹6.50L</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>OWN MARGIN</Text>
              <Text style={styles.metricVal}>₹1.50L</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>SUBSIDY (CMEGP)</Text>
              <Text style={styles.metricVal}>35%</Text>
            </View>
          </View>
        </View>

        {/* 6-Step Journey Cards (Mobile Touch Layout) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your 6-Step Business Journey</Text>
          <Text style={styles.sectionSubtitle}>Take one clear milestone at a time</Text>
        </View>

        {JOURNEY_STEPS.map((item, idx) => (
          <TouchableOpacity
            key={item.step}
            style={styles.stepCard}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate(item.route)}
          >
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNum}>{item.step}</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.subtitle}</Text>
            </View>
            <Text style={styles.stepArrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Quick Tools Row */}
        <View style={styles.toolsRow}>
          <TouchableOpacity 
            style={[styles.toolButton, { backgroundColor: '#e59b10' }]} 
            onPress={() => navigation?.navigate('OCR')}
          >
            <Text style={styles.toolBtnText}>OCR Invoice Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toolButton, { backgroundColor: '#0b2545' }]} 
            onPress={() => navigation?.navigate('ONDC')}
          >
            <Text style={styles.toolBtnText}>ONDC Marketplace</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: {
    backgroundColor: '#0b2545',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16
  },
  tagline: { color: '#e59b10', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#ffffff', fontSize: 22, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#cbd5e1', fontSize: 12, marginTop: 4, lineHeight: 16 },
  decisionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { fontSize: 10, fontWeight: '800', color: '#0b2545', backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusPill: { fontSize: 10, fontWeight: '800', color: '#b45309', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  decisionTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginTop: 8 },
  decisionText: { fontSize: 12, color: '#475569', marginTop: 4, lineHeight: 16 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  metricItem: { alignItems: 'center' },
  metricLabel: { fontSize: 9, fontWeight: '700', color: '#64748b' },
  metricVal: { fontSize: 14, fontWeight: '900', color: '#0b2545', marginTop: 2 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  sectionSubtitle: { fontSize: 11, color: '#64748b', marginTop: 2 },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepNumCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0b2545',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  stepNum: { color: '#e59b10', fontWeight: '900', fontSize: 13 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  stepDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  stepArrow: { fontSize: 16, color: '#94a3b8', fontWeight: '900' },
  toolsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  toolButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  toolBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 11 }
});
