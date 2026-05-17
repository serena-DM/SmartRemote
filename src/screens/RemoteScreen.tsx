import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, StatusBar, Modal,
} from 'react-native';
import { lgService } from '../services/lgWebOS';

// Composant bouton interne
const Btn = ({ label, onPress, color = '#1a1a2e', size = 55, textSize = 14 }: any) => (
  <TouchableOpacity
    style={[styles.btn, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.btnLabel, { fontSize: textSize }]}>{label}</Text>
  </TouchableOpacity>
);

const RemoteScreen = ({ navigation }: any) => {
  const [muted, setMuted] = useState(false);
  const [channelInput, setChannelInput] = useState('');
  const [showNumpad, setShowNumpad] = useState(false);
  const [connected, setConnected] = useState(true);
  const [tvOn, setTvOn] = useState(true);
  const [currentChannel, setCurrentChannel] = useState(1);

  useEffect(() => {
    setConnected(lgService.isTVConnected());
  }, []);

  const handleMute = () => {
    if (muted) { lgService.unmute(); } else { lgService.mute(); }
    setMuted(!muted);
  };

  const handlePower = () => {
    setTvOn(!tvOn);
    lgService.powerOff();
  };

  const handleChannelUp = () => {
    setCurrentChannel(currentChannel + 1);
    lgService.channelUp();
  };

  const handleChannelDown = () => {
    if (currentChannel > 1) {
      setCurrentChannel(currentChannel - 1);
      lgService.channelDown();
    }
  };

  const handleNumpad = (num: string) => {
    if (num === '⌫') {
      setChannelInput(prev => prev.slice(0, -1));
    } else if (num === 'OK') {
      if (channelInput) {
        setCurrentChannel(parseInt(channelInput));
      }
      setShowNumpad(false);
      setChannelInput('');
    } else {
      setChannelInput(prev => (prev.length < 4 ? prev + num : prev));
    }
  };

  const handleApp = (appId: string, name: string) => {
    lgService.launchApp(appId);
    Alert.alert('', `Lancement de ${name}...`);
  };

  // ── Écran TV éteinte ──
  if (!tvOn) {
    return (
      <View style={styles.offContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.offText}>TV OFF</Text>
        <TouchableOpacity onPress={handlePower} style={styles.powerBtn}>
          <Text style={styles.powerBtnText}>Rallumer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>📺 SmartRemote</Text>
          <View style={[styles.dot, { backgroundColor: connected ? '#4ade80' : '#e50914' }]} />
          <TouchableOpacity onPress={() => navigation.navigate('Config')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Power ── */}
        <View style={styles.row}>
          <Btn label="⏻" onPress={handlePower} color="#e50914" size={60} textSize={22} />
        </View>

        {/* ── Chaîne actuelle ── */}
        <Text style={styles.channelDisplay}>
          Chaîne actuelle : {currentChannel}
        </Text>

        {/* ── Volume & Chaînes ── */}
        <View style={styles.section}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>VOL</Text>
            <Btn label="＋" onPress={() => lgService.volumeUp()} color="#16213e" size={52} textSize={22} />
            <View style={{ height: 8 }} />
            <Btn label={muted ? '🔇' : '🔊'} onPress={handleMute} color={muted ? '#e50914' : '#16213e'} size={52} textSize={18} />
            <View style={{ height: 8 }} />
            <Btn label="－" onPress={() => lgService.volumeDown()} color="#16213e" size={52} textSize={22} />
          </View>

          {/* ── Navigation centrale ── */}
          <View style={styles.dpad}>
            <Btn label="▲" onPress={() => lgService.up()} color="#16213e" size={52} textSize={18} />
            <View style={styles.dpadRow}>
              <Btn label="◀" onPress={() => lgService.left()} color="#16213e" size={52} textSize={18} />
              <Btn label="OK" onPress={() => lgService.ok()} color="#e50914" size={62} textSize={15} />
              <Btn label="▶" onPress={() => lgService.right()} color="#16213e" size={52} textSize={18} />
            </View>
            <Btn label="▼" onPress={() => lgService.down()} color="#16213e" size={52} textSize={18} />
          </View>

          <View style={styles.col}>
            <Text style={styles.sectionLabel}>CH</Text>
            <Btn label="＋" onPress={handleChannelUp} color="#16213e" size={52} textSize={22} />
            <View style={{ height: 8 }} />
            <Btn label="🔢" onPress={() => setShowNumpad(true)} color="#16213e" size={52} textSize={18} />
            <View style={{ height: 8 }} />
            <Btn label="－" onPress={handleChannelDown} color="#16213e" size={52} textSize={22} />
          </View>
        </View>

        {/* ── Home & Retour ── */}
        <View style={styles.row}>
          <Btn label="🏠" onPress={() => lgService.home()} color="#16213e" size={52} textSize={20} />
          <View style={{ width: 20 }} />
          <Btn label="↩" onPress={() => lgService.back()} color="#16213e" size={52} textSize={22} />
        </View>

        {/* ── Apps ── */}
        <View style={styles.appsSection}>
          <Text style={styles.sectionLabel}>Applications</Text>
          <View style={styles.appsGrid}>
            {[
              { label: '▶  YouTube', id: 'youtube.leanback.v4', color: '#FF0000' },
              { label: '🎬 Netflix', id: 'netflix', color: '#e50914' },
              { label: '🎵 Spotify', id: 'spotify-beehive', color: '#1DB954' },
              { label: '📺 TV Live', id: 'com.webos.app.livetv', color: '#16213e' },
            ].map((app) => (
              <TouchableOpacity
                key={app.id}
                style={[styles.appBtn, { backgroundColor: app.color }]}
                onPress={() => handleApp(app.id, app.label)}
                activeOpacity={0.8}
              >
                <Text style={styles.appLabel}>{app.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* ── Modal Pavé Numérique ── */}
      <Modal visible={showNumpad} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.numpad}>
            <Text style={styles.numpadTitle}>Numéro de chaîne</Text>
            <Text style={styles.numpadDisplay}>{channelInput || '—'}</Text>
            <View style={styles.numpadGrid}>
              {['1','2','3','4','5','6','7','8','9','⌫','0','OK'].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.numpadBtn, n === 'OK' && { backgroundColor: '#e50914' }, n === '⌫' && { backgroundColor: '#333' }]}
                  onPress={() => handleNumpad(n)}
                >
                  <Text style={styles.numpadBtnText}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => { setShowNumpad(false); setChannelInput(''); }}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  offContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offText: {
    color: 'white',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '700',
  },
  powerBtn: {
    backgroundColor: '#e50914',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
  },
  powerBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 50, paddingBottom: 20, gap: 10,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  settingsIcon: { fontSize: 20, marginLeft: 4 },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 12 },
  section: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 16, paddingHorizontal: 16 },
  col: { alignItems: 'center', gap: 0 },
  sectionLabel: { color: '#8888aa', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
  channelDisplay: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '600',
  },
  dpad: { alignItems: 'center', gap: 6 },
  dpadRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btn: { justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
  btnLabel: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  appsSection: { marginHorizontal: 20, marginTop: 8, marginBottom: 30 },
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  appBtn: { flex: 1, minWidth: '45%', padding: 14, borderRadius: 12, alignItems: 'center' },
  appLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  numpad: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  numpadTitle: { color: '#8888aa', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  numpadDisplay: { color: '#fff', fontSize: 40, fontWeight: '700', textAlign: 'center', marginBottom: 20, letterSpacing: 8 },
  numpadGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  numpadBtn: { width: 75, height: 60, backgroundColor: '#16213e', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  numpadBtnText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  closeText: { color: '#8888aa', textAlign: 'center', marginTop: 20, fontSize: 14 },
});

export default RemoteScreen;
