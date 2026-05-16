import AsyncStorage from '@react-native-async-storage/async-storage';

// Ce sont les permissions qu'on demande à la TV LG
const REGISTER_PAYLOAD = {
  forcePairing: false,
  pairingType: 'PROMPT',
  manifest: {
    manifestVersion: 1,
    appVersion: '1.1',
    signed: {
      created: '20140509',
      appId: 'com.smartremote.app',
      vendorId: 'com.smartremote',
      localizedAppNames: { '': 'SmartRemote' },
      localizedVendorNames: { '': 'SmartRemote App' },
      permissions: [
        'CONTROL_POWER',
        'CONTROL_INPUT_TEXT',
        'CONTROL_MOUSE_AND_KEYBOARD',
        'READ_INSTALLED_APPS',
        'READ_CURRENT_CHANNEL',
        'CONTROL_AUDIO',
        'CONTROL_DISPLAY',
      ],
      serial: '2f930e2d2cfe083771f68e4fe7bb07',
    },
    permissions: [
      'LAUNCH', 'CONTROL_AUDIO', 'CONTROL_DISPLAY',
      'CONTROL_INPUT_TV', 'CONTROL_POWER',
      'READ_CURRENT_CHANNEL', 'READ_RUNNING_APPS',
    ],
    signatures: [{
      signatureVersion: 1,
      signature: 'eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2IiwiaA==',
    }],
  },
};

class LGWebOSService {
  private ws: WebSocket | null = null;
  private pointerWs: WebSocket | null = null;
  private clientKey: string | null = null;
  private msgId: number = 0;
  private callbacks: Map<string, (res: any) => void> = new Map();
  private isConnected: boolean = false;

  // Connexion à la TV via WebSocket (Wi-Fi local, port 3001)
  async connect(
    ip: string,
    onConnect?: () => void,
    onError?: (msg: string) => void,
  ): Promise<void> {
    // On récupère la clé sauvegardée (pour ne pas redemander à chaque fois)
    this.clientKey = await AsyncStorage.getItem('lg_client_key');

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`ws://${ip}:3001`);

        this.ws.onopen = () => {
          this.register(); // On s'enregistre dès la connexion
        };

        this.ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg, onConnect);
        };

        this.ws.onerror = () => {
          this.isConnected = false;
          onError?.('Impossible de se connecter. Vérifiez que la TV est allumée et sur le même Wi-Fi.');
          reject();
        };

        this.ws.onclose = () => {
          this.isConnected = false;
        };

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  // Envoi du message d'enregistrement à la TV
  private register() {
    const payload: any = { ...REGISTER_PAYLOAD };
    if (this.clientKey) {
      payload['client-key'] = this.clientKey; // Si déjà appairé, on envoie la clé
    }
    this.ws?.send(JSON.stringify({
      type: 'register',
      id: 'register_0',
      payload,
    }));
  }

  // Traitement des messages reçus de la TV
  private async handleMessage(msg: any, onConnect?: () => void) {
    if (msg.type === 'registered') {
      this.isConnected = true;
      // Sauvegarde de la clé d'appairage
      if (msg.payload?.['client-key']) {
        this.clientKey = msg.payload['client-key'];
        await AsyncStorage.setItem('lg_client_key', this.clientKey!);
      }
      onConnect?.();
      this.getPointerSocket(); // Récupère le socket pour les touches de navigation
    } else if (msg.type === 'response' || msg.type === 'error') {
      const cb = this.callbacks.get(msg.id);
      if (cb) {
        cb(msg);
        this.callbacks.delete(msg.id);
      }
    }
  }

  // Socket secondaire pour les touches directionnelles (haut/bas/gauche/droite)
  private getPointerSocket() {
    this.sendCommand(
      'ssap://com.webos.service.networkinput/getPointerInputSocket',
      {},
      (res) => {
        if (res.payload?.socketPath) {
          this.pointerWs = new WebSocket(res.payload.socketPath);
        }
      },
    );
  }

  // Envoi d'une commande à la TV (ex: couper le son, changer de chaîne...)
  private sendCommand(uri: string, payload: any = {}, callback?: (res: any) => void): string {
    const id = `cmd_${this.msgId++}`;
    if (callback) this.callbacks.set(id, callback);
    this.ws?.send(JSON.stringify({ type: 'request', id, uri, payload }));
    return id;
  }

  // Envoi d'une touche de navigation (haut, bas, entrée...)
  private sendKey(key: string) {
    if (this.pointerWs?.readyState === WebSocket.OPEN) {
      this.pointerWs.send(`type:key\nkey:${key}\n\n`);
    }
  }

  disconnect() {
    this.ws?.close();
    this.pointerWs?.close();
    this.ws = null;
    this.pointerWs = null;
    this.isConnected = false;
  }

  isTVConnected(): boolean { return this.isConnected; }

  // ── Commandes TV disponibles ──────────────────────────────
  powerOff()     { this.sendCommand('ssap://system/turnOff'); }
  volumeUp()     { this.sendCommand('ssap://audio/volumeUp'); }
  volumeDown()   { this.sendCommand('ssap://audio/volumeDown'); }
  mute()         { this.sendCommand('ssap://audio/setMute', { mute: true }); }
  unmute()       { this.sendCommand('ssap://audio/setMute', { mute: false }); }
  channelUp()    { this.sendCommand('ssap://tv/channelUp'); }
  channelDown()  { this.sendCommand('ssap://tv/channelDown'); }
  home()         { this.sendKey('HOME'); }
  back()         { this.sendKey('BACK'); }
  up()           { this.sendKey('UP'); }
  down()         { this.sendKey('DOWN'); }
  left()         { this.sendKey('LEFT'); }
  right()        { this.sendKey('RIGHT'); }
  ok()           { this.sendKey('ENTER'); }
  launchApp(id: string) {
    this.sendCommand('ssap://com.webos.applicationManager/launch', { id });
  }
}

// On exporte une seule instance (Singleton pattern)
export const lgService = new LGWebOSService();
