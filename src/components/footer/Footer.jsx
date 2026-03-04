import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Brand Section */}
        <div className={styles.footerSection}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>T</div>
            <div className={styles.footerBrandText}>
              <div className={styles.footerBrandName}>TShortner</div>
              <div className={styles.footerBrandTagline}>Smart URL & Earning Panel</div>
            </div>
          </div>
          <p className={styles.footerDescription}>
            Professional URL shortening service with advanced analytics, 
            link management, and earning opportunities.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerSectionTitle}>Quick Links</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/links">Links</Link></li>
            <li><Link to="/wallet">Wallet</Link></li>
          </ul>
        </div>

        {/* Legal & Info */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerSectionTitle}>Legal & Info</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/partnership">Partnership</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerSectionTitle}>Contact Us</h3>
          <ul className={styles.footerContact}>
            <li>
              <span className={styles.contactIcon}>📧</span>
              <span>support@tshortner.in</span>
            </li>
            <li>
              <span className={styles.contactIcon}>💬</span>
              <span>Telegram: @tshortner</span>
            </li>
            <li>
              <span className={styles.contactIcon}>🌐</span>
              <span>www.tshortner.in</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomInner}>
          <p className={styles.footerCopyright}>
            © {currentYear} TShortner. All rights reserved.
          </p>
          <p className={styles.footerDisclaimer}>
            Safe & Legal Short-Link Platform – High Quality Traffic Only.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
