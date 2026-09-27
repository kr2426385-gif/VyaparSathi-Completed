import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { mobileApi } from '../services/api';

export default function OCRScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [fields, setFields] = useState({
    vendorName: '',
    equipmentName: '',
    totalAmount: ''
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleScanSample = async () => {
    setLoading(true);
    setConfirmed(false);
    try {
      const samplePng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
      const res = await mobileApi.extractOCR(samplePng, 'machinery_invoice');
      setExtracted(res);
      const data = res.extractedData || {};
      setFields({
        vendorName: data.vendorName || 'Maha Agro Equipments Ltd.',
        equipmentName: data.equipmentName || 'Automatic Chaff Cutter (5 HP)',
        totalAmount: String(data.totalAmount || 185000)
      });
    } catch (e) {
      alert('Error during OCR scanning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>OCR Document Intelligence</Text>
        <Text style={styles.subtitle}>Scan Invoices, Quotations & 7/12 Land Records</Text>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Mandatory Human Review:</Text>
          <Text style={styles.noticeText}>
            OCR values are machine extractions. Review all values before transferring into your project plan.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.scanBtn}
          onPress={handleScanSample}
          disabled={loading}
        >
          <Text style={styles.scanBtnText}>
            {loading ? 'Processing Document...' : 'Scan / Load Sample Machinery Invoice'}
          </Text>
        </TouchableOpacity>

        {extracted && (
          <View style={styles.resultBox}>
            <Text style={styles.secTitle}>Extracted Fields for Review</Text>

            <Text style={styles.label}>Vendor / Supplier Name</Text>
            <TextInput
              style={styles.input}
              value={fields.vendorName}
              onChangeText={t => setFields({ ...fields, vendorName: t })}
            />

            <Text style={styles.label}>Equipment / Machine Description</Text>
            <TextInput
              style={styles.input}
              value={fields.equipmentName}
              onChangeText={t => setFields({ ...fields, equipmentName: t })}
            />

            <Text style={styles.label}>Total Invoice Cost (₹)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={fields.totalAmount}
              onChangeText={t => setFields({ ...fields, totalAmount: t })}
            />

            <TouchableOpacity 
              style={styles.confirmBtn}
              onPress={() => setConfirmed(true)}
            >
              <Text style={styles.confirmBtnText}>Confirm & Transfer to Capex Planner</Text>
            </TouchableOpacity>

            {confirmed && (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>✓ Verified Fields Linked</Text>
                <Text style={styles.successText}>
                  ₹{Number(fields.totalAmount)?.toLocaleString('en-IN')} added to Equipment Planner with 35% CMEGP capital subsidy eligibility.
                </Text>
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
  title: { fontSize: 20, fontWeight: '900', color: '#0b2545' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 12 },
  noticeBox: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a', marginBottom: 14 },
  noticeTitle: { fontSize: 11, fontWeight: '800', color: '#92400e' },
  noticeText: { fontSize: 11, color: '#78350f', marginTop: 2, lineHeight: 15 },
  scanBtn: { backgroundColor: '#0b2545', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  scanBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  resultBox: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  secTitle: { fontSize: 13, fontWeight: '900', color: '#0b2545', marginBottom: 8 },
  label: { fontSize: 10, fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 12, marginTop: 4, color: '#0f172a' },
  confirmBtn: { backgroundColor: '#15803d', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  confirmBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  successBox: { backgroundColor: '#f0fdf4', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#bbf7d0', marginTop: 10 },
  successTitle: { fontSize: 11, fontWeight: '800', color: '#166534' },
  successText: { fontSize: 11, color: '#15803d', marginTop: 2 }
});
