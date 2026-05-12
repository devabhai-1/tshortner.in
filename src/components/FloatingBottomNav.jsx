import { Link, useLocation } from 'react-router-dom';
import styles from './FloatingBottomNav.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/links', label: 'Links', icon: '🔗' },
  { to: '/wallet', label: 'Wallet', icon: '💰' },
  { to: '/profile/manage', label: 'Profile', icon: '👤' },
  { to: '/support/manage', label: 'Support', icon: '💬' },
];

function isActivePath(pathname, to) {
  if (pathname === to) return true;
  if (to !== '/' && pathname.startsWith(`${to}/`)) return true;
  return false;
}

function FloatingBottomNav() {
  const location = useLocation();

  return (
    <nav className={styles.dock} aria-label="Panel menu">
      <div className={styles.dockInner}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`${styles.item} ${isActivePath(location.pathname, item.to) ? styles.itemActive : ''}`}
          >
            <span className={styles.icon} aria-hidden>
              {item.icon}
            </span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default FloatingBottomNav;
