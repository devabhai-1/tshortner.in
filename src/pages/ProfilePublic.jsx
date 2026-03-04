import { Link } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import styles from './Profile.module.css';

function ProfilePublic() {
  return (
    <div className={styles.publicContainer}>
      <div className={styles.publicHeader}>
        <Link to="/" className={styles.backLink}>← Back to Home</Link>
        <h1>Profile & Account</h1>
        <p>Apne account ki information manage karein aur settings update karein.</p>
      </div>

      <div className={styles.mainInner}>
        <section className={styles.infoSection}>
          <h2>Profile Features</h2>
          
          <div className={styles.featureCard}>
            <h3>📝 Account Information</h3>
            <ul>
              <li>View and edit your name</li>
              <li>Update email address</li>
              <li>Set country for CPM rates</li>
              <li>View account creation date</li>
              <li>Check last login time</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <h3>🔒 Security</h3>
            <ul>
              <li>Change password</li>
              <li>Update security settings</li>
              <li>View account activity</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <h3>📊 Account Statistics</h3>
            <ul>
              <li>Total links created</li>
              <li>Total clicks received</li>
              <li>Account performance metrics</li>
              <li>Earning history</li>
            </ul>
          </div>

          <div className={styles.ctaBox}>
            <h3>Access Your Profile</h3>
            <p>Login karke apna profile manage karo aur account settings update karo.</p>
            <div className={styles.ctaButtons}>
              <Link to="/login" className={styles.primaryButton}>Login Now</Link>
              <Link to="/signup" className={styles.secondaryButton}>Create Account</Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default ProfilePublic;
