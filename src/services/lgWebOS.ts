import { Alert, Linking } from 'react-native';

class LGWebOSService {
  private volume = 10;
  private channel = 1;
  private muted = false;
  private powered = true;

  connect(ip: string, onConnect?: () => void) {
    console.log('Connexion simulée à :', ip);
    setTimeout(() => {
      Alert.alert('Connexion réussie', 'Mode simulation activé');
      onConnect?.();
    }, 1000);
  }

  disconnect() {
    Alert.alert('Déconnexion', 'Télécommande déconnectée');
  }

  powerOff() {
    this.powered = !this.powered;
    Alert.alert(
      'Power',
      this.powered ? 'Télévision allumée' : 'Télévision éteinte'
    );
  }

  volumeUp() {
    this.volume++;
    Alert.alert('Volume', `Volume : ${this.volume}`);
  }

  volumeDown() {
    if (this.volume > 0) {
      this.volume--;
    }
    Alert.alert('Volume', `Volume : ${this.volume}`);
  }

  mute() {
    this.muted = true;
    Alert.alert('Son', 'Mode muet activé');
  }

  unmute() {
    this.muted = false;
    Alert.alert('Son', 'Mode muet désactivé');
  }

  channelUp() {
    this.channel++;
    Alert.alert('Chaîne', `Chaîne ${this.channel}`);
  }

  channelDown() {
    if (this.channel > 1) {
      this.channel--;
    }
    Alert.alert('Chaîne', `Chaîne ${this.channel}`);
  }

  home() {
    Alert.alert('Accueil', 'Retour au menu principal');
  }

  back() {
    Alert.alert('Retour', 'Retour écran précédent');
  }

  up() {
    Alert.alert('Navigation', 'Haut');
  }

  down() {
    Alert.alert('Navigation', 'Bas');
  }

  left() {
    Alert.alert('Navigation', 'Gauche');
  }

  right() {
    Alert.alert('Navigation', 'Droite');
  }

  ok() {
    Alert.alert('Validation', 'Bouton OK pressé');
  }

  async launchApp(app: string) {
    try {
      if (app.includes('youtube')) {
        await Linking.openURL('https://www.youtube.com');
      } else if (app.includes('netflix')) {
        await Linking.openURL('https://www.netflix.com');
      } else if (app.includes('spotify')) {
        await Linking.openURL('https://open.spotify.com');
      } else {
        Alert.alert('Application', app);
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ouvrir l'application");
    }
  }

  isTVConnected() {
    return true;
  }
}

export const lgService = new LGWebOSService();
