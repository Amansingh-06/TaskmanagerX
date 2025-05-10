import { useState, useEffect } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/authContext.jsx';
import { TaskProvider } from './context/taskContext.jsx';
import { requestNotificationPermission, subscribeToTable } from './realtimeSubscription';


const Root = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log('✅ beforeinstallprompt event triggered');
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // ✅ Register service worker and handle push subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js').then(async (registration) => {
        console.log('✅ Service Worker registered:', registration);

        // 🔔 Ask notification permission
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission); // Debugging permission status

        if (permission === 'granted') {
          console.log('✅ Permission granted for notifications');

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,

          });

          console.log('✅ Push Subscription:', subscription); // Log the subscription details

          // 📨 Send subscription to backend
          const response = await fetch('http://localhost:3000/api/save-subscription', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            console.log('✅ Subscription saved successfully');
          } else {
            console.error('❌ Failed to save subscription:', response.status);
          }
        } else {
          console.log('❌ Notification permission denied');
        }

        // 🔁 Handle SW updates
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.onstatechange = () => {
              console.log('🌀 SW state changed:', newWorker.state);
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🚀 Update available – auto reloading');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            };
          }
        };

      }).catch(err => {
        console.error('❌ Service Worker registration failed:', err);
      });
    } else {
      console.log('❌ Service Worker or PushManager not supported');
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ User accepted install');
        } else {
          console.log('❌ User dismissed install');
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
      });
    }
  };

  const handleCancelClick = () => {
    setIsInstallable(false);
  };
  useEffect(() => {
    requestNotificationPermission();
    subscribeToTable();
  }, []);
  return (

    <StrictMode>
      <AuthProvider>
        <TaskProvider>
          <App
            isInstallable={isInstallable}
            onInstallClick={handleInstallClick}
            showInstallBanner={isMobile && isInstallable}
            handleCancelClick={handleCancelClick}
          />
        </TaskProvider>
      </AuthProvider>
    </StrictMode>
  );
};

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<Root />);
