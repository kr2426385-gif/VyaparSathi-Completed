import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { mobileApi } from '../services/api';

export default function MarketScreen() {
  const [commodity, setCommodity] = useState('Milk');
  const [district, setDistrict] = useState('Satara');
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    const res = await mobileApi.getMarketPricing(commodity, district);
    setPriceData(res);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Market Intelligence & APMC</Text>
        <Text style={styles.subtitle}>Wholesale Rates & Mandi Intelligence in Maharashtra</Text>

        <View style={styles.searchBox}>
          <Text style={styles.label}>Commodity / Produce</Text>
          <TextInput
            style={styles.input}
            value={commodity}
            onChangeText={setCommodity}
            placeholder="Milk, Turmeric, Tomato, Jaggery"
          />
          <TouchableOpacity style={styles.btn} onPress={handleSearch}>
            <Text style={styles.btnText}>Query APMC Mandi Rates</Text>
          </TouchableOpacity>
        </View>

        {priceData && (
          <View style={styles.card}>
            <Text style={styles.cardSub}>APMC MANDI BENCHMARK ({district})</Text>
            <Text style={styles.price}>{priceData.price}</Text>
            <Text style={styles.source}>Source: {priceData.source || 'Data.gov.in Agmarknet API'}</Text>
          </View>
        )}

        <View style={styles.nearCard}>
          <Text style={styles.nearTitle}>Nearby Support Infrastructure (Satara)</Text>
          <Text style={styles.nearItem}>• APMC Central Market Yard (Karad) — 2.1 km</Text>
          <Text style={styles.nearItem}>• Cooperative Chilling Center (Koregaon) — 1.4 km</Text>
          <Text style={styles.nearItem}>• District Industries Centre (DIC Satara) — 18 km</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#0b2545' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 14 },
  searchBox: { backgroundColor: '#ffffff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 12, color: '#0f172a' },
  btn: { backgroundColor: '#0b2545', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#ffffff', fontWeight: '800', fontSize: 11 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 14 },
  cardSub: { fontSize: 10, fontWeight: '800', color: '#64748b' },
  price: { fontSize: 18, fontWeight: '900', color: '#0b2545', marginTop: 4 },
  source: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  nearCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  nearTitle: { fontSize: 12, fontWeight: '900', color: '#0b2545', marginBottom: 6 },
  nearItem: { fontSize: 11, color: '#334155', paddingVertical: 3, fontWeight: '500' }
});
