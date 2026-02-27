import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private messaging: Messaging | null = null;

  constructor() {
    try {
      const app = initializeApp(environment.firebaseConfig);
      this.messaging = getMessaging(app);
    } catch (e) {
      console.error('Firebase could not be initialized', e);
    }
  }

  async requestToken(): Promise<string | null> {
    if (!this.messaging) return null;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const currentToken = await getToken(this.messaging, {
          vapidKey: environment.vapidKey
        });
        if (currentToken) {
          return currentToken;
        } else {
          console.warn('No registration token available. Request permission to generate one.');
          return null;
        }
      } else {
        console.warn('Notification permission denied');
        return null;
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
      return null;
    }
  }

  onMessage() {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload: MessagePayload) => {
      console.log('Message received. ', payload);
      // You can show a toast here if the app is in foreground
    });
  }
}
