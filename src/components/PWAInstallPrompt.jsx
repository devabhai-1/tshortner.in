import { useState, useEffect, useRef } from 'react';
import styles from './PWAInstallPrompt.module.css';

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const laterTimeoutRef = useRef(null);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) {
      return;
    }

    // Show popup after delay on initial load
    const showPopup = setTimeout(() => {
      // Check again if installed (state might have changed)
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true);
      }
    }, 1500);

    let promptEvent = null;

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      promptEvent = e;
      setDeferredPrompt(e);
      // Popup already showing via timeout, just ensure it's visible
      setIsVisible(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsVisible(false);
      // Clear any pending timeouts
      if (laterTimeoutRef.current) {
        clearTimeout(laterTimeoutRef.current);
        laterTimeoutRef.current = null;
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(showPopup);
      if (laterTimeoutRef.current) {
        clearTimeout(laterTimeoutRef.current);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for user response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          setIsInstalled(true);
          // Clear any pending timeouts
          if (laterTimeoutRef.current) {
            clearTimeout(laterTimeoutRef.current);
            laterTimeoutRef.current = null;
          }
        }

        setDeferredPrompt(null);
      } catch (error) {
        // If native prompt fails, show manual instructions
        alert('App install karne ke liye browser menu se "Add to Home Screen" ya "Install App" option use karein.');
      }
    } else {
      // If no deferredPrompt, show manual instructions
      alert('App install karne ke liye:\n\nMobile: Browser menu (3 dots) → "Add to Home Screen"\nDesktop: Address bar me install icon click karein');
    }

    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleLater = () => {
    // Close popup
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);

    // Clear any existing timeout
    if (laterTimeoutRef.current) {
      clearTimeout(laterTimeoutRef.current);
    }

    // Show popup again after 30 seconds
    laterTimeoutRef.current = setTimeout(() => {
      // Check if still not installed before showing
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true);
      } else {
        setIsInstalled(true);
      }
      laterTimeoutRef.current = null;
    }, 30000); // 30 seconds
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Always show popup (will be visible after timeout)
  if (!isVisible && !isClosing) {
    return null;
  }

  return (
    <div className={`${styles.pwaPopup} ${isVisible ? styles.show : ''} ${isClosing ? styles.closing : ''}`}>
      <div className={styles.pwaContent}>
        <div className={styles.pwaIcon}>📱</div>
        <div className={styles.pwaText}>
          <strong>TShortner App Install</strong>
          <span>Offline use aur fast access ke liye install karein.</span>
        </div>
        <div className={styles.pwaButtons}>
          <button 
            className={styles.installBtn}
            onClick={handleInstall}
          >
            Install
          </button>
          <button 
            className={styles.laterBtn}
            onClick={handleLater}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
