import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Navbar.module.css';

function Navbar({ subtitle = 'Premium Dashboard' }) {
  const { user, userName, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/links', label: 'Links' },
    { path: '/wallet', label: 'Wallet' },
    { path: '/partnership/manage', label: 'Partnership' },
    { path: '/profile/manage', label: 'Profile' },
    { path: '/support/manage', label: 'Support' }
  ];

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
          <div className={styles.logoCircle}></div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>TShortner</span>
            <span className={styles.brandSub}>{subtitle}</span>
          </div>
        </div>

        <nav className={styles.navMenu}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
