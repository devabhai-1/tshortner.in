import { Link } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import styles from './Privacy.module.css';

function Privacy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: January 3, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            Jab tum Shortner Panel use karte ho, hum ye information collect karte hain:
          </p>
          <ul>
            <li>Email address (login ke liye)</li>
            <li>Name aur country (profile info)</li>
            <li>Link data (short links jo tum create karte ho)</li>
            <li>Earning aur payment details (wallet transactions)</li>
            <li>Usage analytics (kaise panel use kar rahe ho)</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>Tumhara data sirf in purposes ke liye use hota hai:</p>
          <ul>
            <li>Account management aur authentication</li>
            <li>Earnings tracking aur payment processing</li>
            <li>Service improvement aur bug fixes</li>
            <li>Support aur customer service</li>
            <li>Legal compliance aur fraud prevention</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Storage & Security</h2>
          <p>
            Tumhara sara data Firebase Realtime Database me securely store hota hai.
            Hum industry-standard encryption aur security practices follow karte hain.
          </p>
          <ul>
            <li>Data encrypted in transit (HTTPS)</li>
            <li>Firebase authentication for secure access</li>
            <li>Regular security audits</li>
            <li>No third-party data selling</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing</h2>
          <p>
            Hum tumhara personal data kisi third party ke saath share nahi karte,
            except in cases jahan legally required ho (e.g., court orders).
          </p>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>Tumhe ye rights hain:</p>
          <ul>
            <li>Apna data access karne ka (profile page se)</li>
            <li>Data correction ya update karne ka</li>
            <li>Account delete karne ka (support se contact karke)</li>
            <li>Data export request karne ka</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies & Tracking</h2>
          <p>
            Hum essential cookies use karte hain authentication ke liye. Analytics
            cookies optional hain aur browser settings me disable kar sakte ho.
          </p>
        </section>

        <section>
          <h2>7. Changes to This Policy</h2>
          <p>
            Hum ye privacy policy kabhi bhi update kar sakte hain. Major changes ke
            liye email notification bhejenge.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            Privacy concerns ke liye contact karo:<br />
            Email: support@example.com<br />
            Telegram: @your_support_channel
          </p>
        </section>

      </div>
      <Footer />
    </div>
  );
}

export default Privacy;
