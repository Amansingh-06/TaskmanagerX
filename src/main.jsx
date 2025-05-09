import { useState, useEffect } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/authContext.jsx';
import { TaskProvider } from './context/taskContext.jsx';

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

    // ✅ Register single service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('✅ Service Worker registered:', registration);

        // 🔔 Request notification permission
       
        // 🌀 SW update lifecycle
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
