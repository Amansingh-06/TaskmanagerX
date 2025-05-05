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
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log('✅ beforeinstallprompt event triggered');
      if (!localStorage.getItem('installPromptDismissed')) {
        setDeferredPrompt(e);
        setIsInstallable(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration);

            registration.onupdatefound = () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.onstatechange = () => {
                  console.log('🌀 SW state changed:', newWorker.state);
                  if (newWorker.state === 'installed') {
                    console.log(
                      navigator.serviceWorker.controller
                        ? '🚀 Update available – auto reloading'
                        : '🆕 First time install'
                    );
                    if (navigator.serviceWorker.controller) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error('❌ SW registration failed:', error);
          });
      });
    }


    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log(permission === 'granted' ? 'Notification granted' : 'Notification denied');
      });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle install button click
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
        localStorage.setItem('installPromptDismissed', 'true');
      });
    }
  };

  // Handle cancel install prompt
  const handleCancelClick = () => {
    setIsInstallable(false);
    localStorage.setItem('installPromptDismissed', 'true');
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
