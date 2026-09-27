import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { mobileApi } from '../services/api';

export default function ONDCScreen() {
  const [items, setItems] = useState([]);
  const [simulated, setSimulated] = useState(null);

  useEffect(() => {
    mobileApi.getONDCListings().then(setItems);
  }, []);

  const handleSimulate = (item) => {
    setSimulated({
      orderId: 'ORD_MOB_' + Math.floor(Math.random() * 90000 + 10000),
      itemName: item.name,
      total: item.price + 50
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>ONDC Rural Marketplace</Text>
        <Text style={styles.subtitle}>Open Digital Commerce for Maharashtra FPOs & MSMEs</Text>

        <View style={styles.protoBanner}>
          <Text style={styles.protoTag}>BECKN PROTOCOL V1.2 (SANDBOX HARNESS)</Text>
          <Text style={styles.protoText}>
            Direct farmer-to-buyer open network integration. Test sandbox order simulation below.
          </Text>
        </View>

        {items.map(it => (
          <View key={it.id} style={styles.itemCard}>
            <Text style={styles.sellerName}>{it.providerName || 'Rural Enterprise'}</Text>
            <Text style={styles.itemName}>{it.name}</Text>
            <Text style={styles.itemPrice}>₹{it.price} <Text style={styles.itemUnit}>/ {it.unit}</Text></Text>

            <TouchableOpacity 
              style={styles.orderBtn}
              onPress={() => handleSimulate(it)}
            >
              <Text style={styles.orderBtnText}>Test Sandbox Order (Beckn Confirm)</Text>
            </TouchableOpacity>
          </View>
        ))}

        {simulated && (
          <View style={styles.simCard}>
            <Text style={styles.simTitle}>✓ Sandbox Protocol Order Simulated</Text>
            <Text style={styles.simText}>Order ID: {simulated.orderId}</Text>
            <Text style={styles.simText}>Item: {simulated.itemName}</Text>
            <Text style={styles.simText}>Total: ₹{simulated.total} (Including delivery)</Text>
            <Text style={styles.simSub}>No real currency deducted. Protocol handshake confirmed.</Text>
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
  protoBanner: { backgroundColor: '#e0f2fe', padding: 12, borderRadius: 12, marginBottom: 14 },
  protoTag: { fontSize: 9, fontWeight: '900', color: '#0369a1', letterSpacing: 0.5 },
  protoText: { fontSize: 11, color: '#0c4a6e', marginTop: 2 },
  itemCard: { backgroundColor: '#ffffff', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  sellerName: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  itemName: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '900', color: '#0b2545', marginTop: 6 },
  itemUnit: { fontSize: 11, fontWeight: '500', color: '#64748b' },
  orderBtn: { backgroundColor: '#0b2545', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  orderBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 11 },
  simCard: { backgroundColor: '#f0fdf4', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#bbf7d0', marginTop: 10 },
  simTitle: { fontSize: 12, fontWeight: '800', color: '#166534', marginBottom: 4 },
  simText: { fontSize: 11, color: '#15803d', fontWeight: '600' },
  simSub: { fontSize: 10, color: '#166534', marginTop: 4, fontStyle: 'italic' }
});
