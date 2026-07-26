import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Navbar.module.css';

function Navbar({ subtitle = 'Premium Dashboard' }) {
  const { userName, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      alert("Logout me problem: " + (err.code || err.message));
    }
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <header className={styles.navbar}>
      <div className={styles.navInner}>
        <div className={styles.navLeft}>
          <div className={styles.logoCircle}>
            <svg viewBox="0 0 512 512" className={styles.logoSvgIcon}>
              <g transform="translate(256, 256) rotate(-45)">
                <path d="M -16,-48 H 64 A 48,48 0 0,1 64,48 H -16" fill="none" stroke="#FFFFFF" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M 16,48 H -64 A 48,48 0 0,1 -64,-48 H 16" fill="none" stroke="#FFFFFF" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="-40" y1="0" x2="40" y2="0" stroke="#FFFFFF" strokeWidth="44" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>TeraBox Shortener</span>
            <span className={styles.brandSub}>{subtitle}</span>
          </div>
        </div>

        <div className={styles.navRight}>
          <button className={styles.themeToggle} onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
            {theme === 'light' ? (
              <span className={styles.themeIcon}>🌙</span>
            ) : (
              <span className={styles.themeIcon}>☀️</span>
            )}
            <span className={styles.themeLabel}>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
          <div className={styles.userPill}>
            <div className={styles.avatar}>{initial}</div>
            <div>
              <div className={styles.userName}>{userName || 'Loading...'}</div>
              <div className={styles.userRole}>Publisher</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
