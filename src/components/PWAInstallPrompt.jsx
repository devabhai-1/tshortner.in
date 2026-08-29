import { useState, useEffect, useRef } from 'react';
import styles from './PWAInstallPrompt.module.css';

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hint, setHint] = useState('');
  const laterTimeoutRef = useRef(null);

  useEffect(() => {
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

    const dismissed = sessionStorage.getItem('tshortner_pwa_dismissed') === '1';

    // Fallback tip (iOS / browsers without beforeinstallprompt)
    const showPopup = setTimeout(() => {
      if (
        !dismissed &&
        !window.matchMedia('(display-mode: standalone)').matches
      ) {
        setIsVisible(true);
      }
    }, 2500);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsVisible(false);
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

  const closeBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      setHint('');
    }, 300);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          if (laterTimeoutRef.current) {
            clearTimeout(laterTimeoutRef.current);
            laterTimeoutRef.current = null;
          }
        }
        setDeferredPrompt(null);
        closeBanner();
        return;
      } catch {
        setHint('Browser menu → Install app / Add to Home Screen');
        return;
      }
    }

    setHint('Mobile: ⋮ menu → Add to Home Screen · Desktop: address bar install icon');
  };

  const handleLater = () => {
    try {
      sessionStorage.setItem('tshortner_pwa_dismissed', '1');
    } catch {
      /* ignore */
    }
    closeBanner();

    if (laterTimeoutRef.current) {
      clearTimeout(laterTimeoutRef.current);
    }

    laterTimeoutRef.current = setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        try {
          sessionStorage.removeItem('tshortner_pwa_dismissed');
        } catch {
          /* ignore */
        }
        setIsVisible(true);
      } else {
        setIsInstalled(true);
      }
      laterTimeoutRef.current = null;
    }, 60000);
  };

  if (isInstalled) {
    return null;
  }

  if (!isVisible && !isClosing) {
    return null;
  }

  return (
    <div
      className={`${styles.pwaPopup} ${isVisible ? styles.show : ''} ${isClosing ? styles.closing : ''}`}
    >
      <div className={styles.pwaContent}>
        <div className={styles.pwaIconWrap}>
          <img
            src="/icon-192x192.png"
            alt=""
            width={48}
            height={48}
            className={styles.pwaLogo}
          />
        </div>
        <div className={styles.pwaText}>
          <strong>Install TShortner</strong>
          <span>
            {hint || 'Home screen pe add karo — fast access with app logo.'}
          </span>
        </div>
        <div className={styles.pwaButtons}>
          <button type="button" className={styles.installBtn} onClick={handleInstall}>
            Install
          </button>
          <button type="button" className={styles.laterBtn} onClick={handleLater}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
