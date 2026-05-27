import { useState, useEffect } from 'react';
import styles from './PopupBanner.module.css';

function PopupBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId;
    let intervalId;

    const showPopup = () => {
      setIsClosing(false);
      setIsVisible(true);
    };

    const hidePopup = () => {
      setIsClosing(true);
      timeoutId = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
    };

    // Show popup initially after 1 second
    timeoutId = setTimeout(showPopup, 1000);

    // Show popup every 2 seconds, hide after 1.5 seconds
    intervalId = setInterval(() => {
      showPopup();
      // Auto-hide after 1.5 seconds
      timeoutId = setTimeout(hidePopup, 1500);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible && !isClosing) return null;

  return (
    <div className={`${styles.popupBanner} ${isVisible ? styles.show : ''} ${isClosing ? styles.closing : ''}`}>
      <div className={styles.popupContent}>
        <div className={styles.popupIcon}>🎉</div>
        <div className={styles.popupText}>
          <strong>TShortner - Smart URL Shortener</strong>
          <span>Apne links ko shorten karo aur earning start karo!</span>
        </div>
        <button 
          className={styles.popupClose}
          onClick={handleClose}
          aria-label="Close popup"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default PopupBanner;
