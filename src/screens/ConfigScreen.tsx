import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lgService } from '../services/lgWebOS';

const ConfigScreen = ({ navigation }: any) => {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedIp, setSavedIp] = useState('');

  // Au chargement, on récupère l'IP sauvegardée
  useEffect(() => {
    AsyncStorage.getItem('tv_ip').then(val => {
      if (val) { setIp(val); setSavedIp(val); }
    });
  }, []);

  const handleConnect = async () => {
    if (!ip.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer l\'adresse IP de votre TV');
      return;
    }

    setLoading(true);

    try {
      await AsyncStorage.setItem('tv_ip', ip.trim());

      await lgService.connect(
        ip.trim(),
        () => {
          // Connexion réussie !
          setLoading(false);
          Alert.alert(
            '✅ Connecté !',
            'Votre TV LG est connectée. Si c\'est la première fois, acceptez la demande sur votre TV.',
            [{ text: 'Ouvrir la télécommande', onPress: () => navigation.navigate('Remote') }]
          );
        },
        (errMsg) => {
          // Erreur de connexion
          setLoading(false);
          Alert.alert('❌ Erreur de connexion', errMsg);
        }
      );
    } catch (e) {
      setLoading(false);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleReset = async () => {
    await AsyncStorage.multiRemove(['tv_ip', 'lg_client_key']);
    setIp('');
    setSavedIp('');
    lgService.disconnect();
    Alert.alert('Réinitialisé', 'La configuration a été effacée.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo / Titre */}
      <View style={styles.header}>
        <Text style={styles.logo}>📺</Text>
        <Text style={styles.title}>SmartRemote</Text>
        <Text style={styles.subtitle}>Connectez votre TV LG WebOS</Text>
      </View>

      {/* Carte de configuration */}
      <View style={styles.card}>
        <Text style={styles.label}>Adresse IP de la TV</Text>
        <TextInput
          style={styles.input}
          value={ip}
          onChangeText={setIp}
          placeholder="ex: 192.168.1.45"
          placeholderTextColor="#999"
          keyboardType="numeric"
          autoCorrect={false}
        />

        <Text style={styles.hint}>
          💡 Pour trouver l'IP de votre TV : Paramètres → Réseau → Infos Wi-Fi
        </Text>

        {savedIp ? (
          <Text style={styles.savedInfo}>Dernière TV : {savedIp}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnConnect, loading && styles.btnDisabled]}
          onPress={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        {savedIp ? (
          <TouchableOpacity style={styles.btnReset} onPress={handleReset}>
            <Text style={styles.btnResetText}>Réinitialiser la configuration</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Étapes */}
      <View style={styles.steps}>
        <Text style={styles.stepsTitle}>Comment ça marche ?</Text>
        {[
          'Connectez votre téléphone et votre TV au même Wi-Fi',
          'Entrez l\'adresse IP de votre TV LG ci-dessus',
          'Appuyez sur "Se connecter" — acceptez sur la TV',
          'Profitez de votre télécommande !',
        ].map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0f0f1a', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  logo: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#ffffff', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#8888aa', marginTop: 6 },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: 16,
    padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#2a2a4e',
  },
  label: { fontSize: 14, color: '#8888aa', marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#0f0f1a', borderRadius: 10, padding: 14,
    fontSize: 16, color: '#ffffff', borderWidth: 1, borderColor: '#2a2a4e',
    marginBottom: 12,
  },
  hint: { fontSize: 12, color: '#6666aa', marginBottom: 16, lineHeight: 18 },
  savedInfo: { fontSize: 12, color: '#4ade80', marginBottom: 12 },
  btnConnect: {
    backgroundColor: '#e50914', borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  btnReset: { alignItems: 'center', padding: 8 },
  btnResetText: { color: '#6666aa', fontSize: 13 },
  steps: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2a2a4e' },
  stepsTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#e50914', justifyContent: 'center', alignItems: 'center',
  },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepText: { flex: 1, color: '#ccccdd', fontSize: 13, lineHeight: 20 },
});

export default ConfigScreen;
