import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request permission and fetch the FCM token
export const getFCMToken = async () => {
    try {
        // Request notification permission
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('🔔 Notification permission granted');

            // 📲 Get FCM Token
            const token = await getToken(messaging, {
                vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY, // VAPID key from env
            });

            if (token) {
                console.log('📱 FCM Token:', token);
                return token; // Return the token
            } else {
                console.warn('⚠️ No registration token available.');
                return null;
            }
        } else {
            console.warn('🔕 Notification permission denied');
            return null;
        }
    } catch (err) {
        console.error('😢 Token error:', err);
        return null;
    }
};

// Foreground notification handling
onMessage(messaging, (payload) => {
    console.log('📨 Message received in foreground:', payload);
    if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/pwa192.png',
        });
    } else {
        alert(`${payload.notification.title} - ${payload.notification.body}`);
    }
});
