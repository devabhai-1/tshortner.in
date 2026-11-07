import { Link } from 'react-router-dom';
import styles from './PlayerLegal.module.css';

export default function PlayerPrivacy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span>📱</span> T-Player Application Policy
        </div>

        <h1>Privacy Policy for T-Player</h1>
        <p className={styles.lastUpdated}>
          Application: <strong>T-Player</strong> (Package: <code>in.tshortner.t_player</code>) &bull; Last Updated: November 7, 2026
        </p>

        {/* Tab Navigation for Player Legal */}
        <div className={styles.tabNav}>
          <Link to="/player/privacy" className={`${styles.tabLink} ${styles.activeTab}`}>
            🔒 Privacy Policy
          </Link>
          <Link to="/player/terms" className={styles.tabLink}>
            📜 Terms of Service
          </Link>
          <Link to="/player/contact" className={styles.tabLink}>
            ✉️ Contact Us
          </Link>
        </div>

        <div className={styles.highlightBox}>
          <p>
            <strong>Core Privacy Principle:</strong> T-Player is designed as an offline-first, on-device media player and file viewer. 
            We do <strong>NOT</strong> collect, store, sell, or transmit any of your personal data, media files, photos, or documents to any remote server.
          </p>
        </div>

        <section>
          <h2>1. Overview of T-Player</h2>
          <p>
            T-Player is a cross-platform multimedia playback and file inspection tool developed for Android. 
            It allows users to play local videos and audio, inspect and zoom high-resolution photos, view text, code, and log files, and stream media from user-provided URLs.
            No user registration, account creation, or sign-in is required to use T-Player.
          </p>
        </section>

        <section>
          <h2>2. Information We Access and How It Is Used</h2>
          <p>
            T-Player requests access to system features and hardware solely to perform the functions you explicitly trigger. We access:
          </p>
          <ul>
            <li>
              <strong>Photos & Videos (<code>READ_MEDIA_VIDEO</code>, <code>READ_MEDIA_IMAGES</code>, <code>READ_MEDIA_VISUAL_USER_SELECTED</code>):</strong>
              Required to scan, catalog, and display local videos, albums, and photos directly on your device screen. Your files remain exclusively on your phone storage and are never uploaded, analyzed, or shared.
            </li>
            <li>
              <strong>Audio Files (<code>READ_MEDIA_AUDIO</code>):</strong>
              Used only to index and play music, voice recordings, and sound tracks stored on your device.
            </li>
            <li>
              <strong>Device Storage (<code>READ_EXTERNAL_STORAGE</code> / File Access):</strong>
              Used when you pick files or documents (.txt, .log, .json, .pdf, code files) from internal storage or SD card for viewing.
            </li>
            <li>
              <strong>Network & Internet (<code>INTERNET</code>, <code>ACCESS_NETWORK_STATE</code>):</strong>
              Used exclusively when you choose to play a remote video stream or media URL that you have provided. T-Player connects only to the specified destination host to stream content.
            </li>
            <li>
              <strong>Foreground Service & Notifications (<code>FOREGROUND_SERVICE_MEDIA_PLAYBACK</code>, <code>POST_NOTIFICATIONS</code>):</strong>
              Allows audio or background video playback to continue uninterrupted when your screen locks or when switching between applications.
            </li>
            <li>
              <strong>Screen Wake Lock (<code>WAKE_LOCK</code>):</strong>
              Prevents the device screen from dimming or sleeping while you are actively watching a video.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. What We Never Do</h2>
          <ul>
            <li><strong>No Account Tracking:</strong> We do not ask for your name, phone number, email, or passwords.</li>
            <li><strong>No Data Brokering:</strong> We never sell, rent, monetize, or trade your personal information or media library to data brokers or third parties.</li>
            <li><strong>No Behavioral Tracking:</strong> We do not track your viewing habits, watch history, or private media files.</li>
            <li><strong>No Background Surveillance:</strong> The app does not access your microphone, camera, contacts, or GPS location.</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-Party Services and External Links</h2>
          <p>
            If you use the URL streaming feature to load streams from third-party websites or services, your device will connect directly to that third-party server. 
            Those external third-party hosts operate under their own independent privacy policies, and T-Player is not responsible for their data practices.
          </p>
        </section>

        <section>
          <h2>5. Children&apos;s Privacy (COPPA & GDPR Compliance)</h2>
          <p>
            T-Player does not target children under the age of 13 and does not knowingly collect any personally identifiable information from children. 
            Because all playback occurs locally on the device without data transmission, our application is safe for general audiences.
          </p>
        </section>

        <section>
          <h2>6. Data Retention and Deletion</h2>
          <p>
            Since T-Player does not collect or transmit your personal data to cloud servers, there is no remote user data to retain. 
            Any temporary application cache, playlists, or recent URL history can be cleared at any time by clearing the application storage via Android System Settings.
          </p>
        </section>

        <section>
          <h2>7. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time to reflect application improvements or legal requirements. 
            The updated policy will always be published at this permanent URL with the effective revision date.
          </p>
        </section>

        <section>
          <h2>8. Developer Contact Information</h2>
          <p>
            If you have questions, concerns, or feedback regarding T-Player&apos;s privacy practices, please contact our dedicated developer support team:
          </p>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h3>📧 Developer Email</h3>
              <p>For privacy inquiries & policy questions:</p>
              <a href="mailto:privacy@tshortner.in">privacy@tshortner.in</a>
            </div>
            <div className={styles.contactCard}>
              <h3>🛠️ Technical Support</h3>
              <p>For app bugs & feature assistance:</p>
              <a href="mailto:support@tshortner.in">support@tshortner.in</a>
            </div>
          </div>
        </section>

        <Link to="/" className={styles.backHome}>
          &larr; Back to TShortner Home
        </Link>
      </div>
    </div>
  );
}
