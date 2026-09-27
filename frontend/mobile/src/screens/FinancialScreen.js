import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { mobileApi } from '../services/api';

export default function FinancialScreen() {
  const [outlay, setOutlay] = useState('650000');
  const [ownMargin, setOwnMargin] = useState('150000');
  const [metrics, setMetrics] = useState(null);

  const handleCalculate = async () => {
    const res = await mobileApi.calculateFinancials({
      investmentRequirement: Number(outlay),
      ownContribution: Number(ownMargin)
    });
    setMetrics(res);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Financial Health & Capex Planner</Text>
        <Text style={styles.subtitle}>Deterministic Agricultural & MSME Capital Structuring</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Total Project Cost (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={outlay}
            onChangeText={setOutlay}
          />

          <Text style={styles.label}>Promoter Contribution / Own Margin (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={ownMargin}
            onChangeText={setOwnMargin}
          />

          <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate}>
            <Text style={styles.calcBtnText}>Calculate Capital Structure & EMI</Text>
          </TouchableOpacity>
        </View>

        {metrics && (
          <View style={styles.resultCard}>
            <Text style={styles.resTitle}>Bank Appraisal Summary</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Total Project Cost:</Text>
              <Text style={styles.rowVal}>₹{metrics.totalProjectCost?.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Promoter Own Equity:</Text>
              <Text style={styles.rowVal}>₹{metrics.ownContribution?.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Required Bank Loan:</Text>
              <Text style={[styles.rowVal, { color: '#b91c1c' }]}>₹{metrics.loanRequirement?.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Est. Monthly Bank EMI:</Text>
              <Text style={styles.rowVal}>₹{metrics.monthlyEmi?.toLocaleString('en-IN')}/mo</Text>
            </View>
            <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8, marginTop: 4 }]}>
              <Text style={styles.rowLabel}>CMEGP 35% Capital Subsidy:</Text>
              <Text style={[styles.rowVal, { color: '#15803d' }]}>₹{metrics.subsidyEligibleAmount?.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#0b2545' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 11, fontWeight: '800', color: '#334155', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 13, color: '#0f172a' },
  calcBtn: { backgroundColor: '#0b2545', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  calcBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  resultCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#cbd5e1' },
  resTitle: { fontSize: 13, fontWeight: '900', color: '#0b2545', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 12, color: '#475569' },
  rowVal: { fontSize: 12, fontWeight: '800', color: '#0f172a' }
});
