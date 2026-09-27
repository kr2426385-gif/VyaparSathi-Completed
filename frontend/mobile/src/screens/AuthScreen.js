import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { mobileApi } from '../services/api';

export default function AuthScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('demo@sahyadri.org');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Validation Error', 'Please enter your registered email or mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await mobileApi.login(email, password);
      if (res?.user) {
        if (onLoginSuccess) onLoginSuccess(res.user);
        navigation?.replace('Main');
      }
    } catch (e) {
      Alert.alert('Login Notice', e.message || 'Connecting in offline guest mode.');
      navigation?.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brandTitle}>VyaparSathi (व्यापारसाथी)</Text>
        <Text style={styles.brandSub}>Rural Entrepreneur & Agri MSME Access</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email / Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. 9822012345 or user@domain.com"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Signing In...' : 'Sign In to My MSME'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guestBtn}
            onPress={handleLogin}
          >
            <Text style={styles.guestBtnText}>Continue as Demo Entrepreneur (Ramesh Patil)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b2545', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  brandTitle: { fontSize: 20, fontWeight: '900', color: '#0b2545', textAlign: 'center' },
  brandSub: { fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  form: { gap: 12 },
  label: { fontSize: 11, fontWeight: '800', color: '#334155', textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12, fontSize: 13, color: '#0f172a' },
  loginBtn: { backgroundColor: '#0b2545', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  loginBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },
  guestBtn: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a', padding: 12, borderRadius: 12, alignItems: 'center' },
  guestBtnText: { color: '#92400e', fontWeight: '800', fontSize: 11 }
});
