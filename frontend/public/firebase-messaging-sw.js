// Import Firebase Messaging scripts
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
});

// Get Firebase Messaging instance
const messaging = firebase.messaging();

console.log("✅ firebase-messaging-sw.js loaded");

// Handle background notification
messaging.onBackgroundMessage(function (payload) {
    console.log('🎯 Received background message: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa192.png', // Optional
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
