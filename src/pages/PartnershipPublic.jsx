import { Link } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import styles from './Partnership.module.css';

function PartnershipPublic() {
  return (
    <div className={styles.publicContainer}>
      <div className={styles.publicHeader}>
        <Link to="/" className={styles.backLink}>← Back to Home</Link>
        <h1>Partnership Program</h1>
        <p>Refer users aur earn commission. Apne referral links se passive income generate karo.</p>
      </div>

      <div className={styles.mainInner}>
        <section className={styles.infoSection}>
          <h2>How Partnership Works</h2>
          
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Create Referral Link</h3>
              <p>
                Login karke Partnership page par jao aur apna custom referral link create karo. 
                Aap custom code (6-12 characters) bhi set kar sakte ho.
              </p>
            </div>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Share Your Link</h3>
              <p>
                Apne referral link ko share karo – Telegram, WhatsApp, social media, ya kisi bhi platform par. 
                Jab koi user is link se signup karega, wo automatically aapke referral me add ho jayega.
              </p>
            </div>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Earn Commission</h3>
              <p>
                Aap apne referral users ki earning ka percentage earn karte ho. 
                Percentage aap set kar sakte ho (minimum/maximum limits apply). 
                Max 50 signups per referral link allowed hain.
              </p>
            </div>
          </div>

          <div className={styles.benefitsBox}>
            <h3>Partnership Benefits</h3>
            <ul>
              <li>✓ Passive income from referrals</li>
              <li>✓ Custom referral codes</li>
              <li>✓ Real-time signup tracking</li>
              <li>✓ Percentage-based earnings</li>
              <li>✓ Multiple referral links support</li>
            </ul>
          </div>

          <div className={styles.ctaBox}>
            <h3>Ready to Start?</h3>
            <p>Login karke Partnership page par jao aur apna referral link create karo.</p>
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

export default PartnershipPublic;
