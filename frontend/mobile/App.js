import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Screen imports
import HomeScreen from './src/screens/HomeScreen';
import AdvisoryScreen from './src/screens/AdvisoryScreen';
import FinancialScreen from './src/screens/FinancialScreen';
import SchemesScreen from './src/screens/SchemesScreen';
import MarketScreen from './src/screens/MarketScreen';
import OCRScreen from './src/screens/OCRScreen';
import ONDCScreen from './src/screens/ONDCScreen';
import AuthScreen from './src/screens/AuthScreen';

const TABS = [
  { id: 'Home', label: 'Journey' },
  { id: 'Advisory', label: 'AI Advisor' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Market', label: 'Market' },
  { id: 'Schemes', label: 'Schemes' },
  { id: 'OCR', label: 'OCR' },
  { id: 'ONDC', label: 'ONDC' }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [currentUser, setCurrentUser] = useState({ name: 'Ramesh Patil', district: 'Satara' });

  // Navigation helper compatible with simple prop navigation
  const navigation = {
    navigate: (name) => setCurrentScreen(name),
    replace: (name) => setCurrentScreen(name)
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigation={navigation} user={currentUser} />;
      case 'Advisory':
        return <AdvisoryScreen navigation={navigation} user={currentUser} />;
      case 'Finance':
        return <FinancialScreen navigation={navigation} user={currentUser} />;
      case 'Market':
        return <MarketScreen navigation={navigation} user={currentUser} />;
      case 'Schemes':
        return <SchemesScreen navigation={navigation} user={currentUser} />;
      case 'OCR':
        return <OCRScreen navigation={navigation} user={currentUser} />;
      case 'ONDC':
        return <ONDCScreen navigation={navigation} user={currentUser} />;
      case 'Auth':
        return <AuthScreen navigation={navigation} onLoginSuccess={setCurrentUser} />;
      default:
        return <HomeScreen navigation={navigation} user={currentUser} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0b2545" />

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Persistent Bottom Mobile Navigation Bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = currentScreen === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setCurrentScreen(tab.id)}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  screenContainer: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0b2545',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e3a5f',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabItem: { alignItems: 'center', paddingHorizontal: 4 },
  tabLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
  tabLabelActive: { color: '#e59b10', fontWeight: '900' },
  activeIndicator: { width: 14, height: 2, backgroundColor: '#e59b10', borderRadius: 1, marginTop: 3 }
});
