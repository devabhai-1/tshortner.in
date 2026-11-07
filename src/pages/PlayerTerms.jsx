import { Link } from 'react-router-dom';
import styles from './PlayerLegal.module.css';

export default function PlayerTerms() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span>📱</span> T-Player Terms of Service
        </div>

        <h1>Terms of Service for T-Player</h1>
        <p className={styles.lastUpdated}>
          Application: <strong>T-Player</strong> (Package: <code>in.tshortner.t_player</code>) &bull; Last Updated: November 7, 2026
        </p>

        {/* Tab Navigation for Player Legal */}
        <div className={styles.tabNav}>
          <Link to="/player/privacy" className={styles.tabLink}>
            🔒 Privacy Policy
          </Link>
          <Link to="/player/terms" className={`${styles.tabLink} ${styles.activeTab}`}>
            📜 Terms of Service
          </Link>
          <Link to="/player/contact" className={styles.tabLink}>
            ✉️ Contact Us
          </Link>
        </div>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By downloading, installing, accessing, or using the <strong>T-Player</strong> mobile application, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). 
            If you do not agree to these Terms, please do not install or use the T-Player application.
          </p>
        </section>

        <section>
          <h2>2. License to Use</h2>
          <p>
            We grant you a personal, revocable, non-exclusive, non-transferable, limited license to download, install, and use T-Player on your mobile devices strictly for your personal, non-commercial multimedia playback and file inspection purposes in accordance with these Terms.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities & Content Compliance</h2>
          <p>
            T-Player functions strictly as a multimedia software tool (player and file reader). T-Player does not host, provide, broadcast, or index any copyrighted media files.
          </p>
          <ul>
            <li>
              <strong>Content Rights:</strong> You affirm that you possess the necessary legal rights, licenses, or permissions to play, view, or stream any files or URLs you load into T-Player.
            </li>
            <li>
              <strong>No Illegal Content:</strong> You agree not to use T-Player to stream, display, or distribute content that infringes upon copyright, trademark, or any third-party proprietary rights, or that violates applicable laws.
            </li>
            <li>
              <strong>No Reverse Engineering:</strong> You agree not to decompile, reverse-engineer, modify, or attempt to derive the source code of T-Player, or circumvent security protections.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Streaming and Third-Party Links</h2>
          <p>
            When you enter an external streaming URL, T-Player acts purely as a technical conduit to play the media stream from your device to the remote endpoint. 
            We do not control, endorse, or assume responsibility for the content, performance, or availability of third-party streams or servers.
          </p>
        </section>

        <section>
          <h2>5. Disclaimer of Warranties</h2>
          <div className={styles.highlightBox}>
            <p>
              T-Player is provided on an <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or uninterrupted, bug-free operation.
            </p>
          </div>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, the developers, publishers, and affiliates of T-Player shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the application or third-party content.
          </p>
        </section>

        <section>
          <h2>7. Updates and Modifications</h2>
          <p>
            We reserve the right to modify, improve, or release updates for T-Player, or revise these Terms at any time. Continued use of T-Player following the posting of updated Terms constitutes your acceptance of the changes.
          </p>
        </section>

        <section>
          <h2>8. Contact & Inquiries</h2>
          <p>
            If you have questions regarding these Terms of Service, please reach out to us:
          </p>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h3>📧 Legal & Compliance</h3>
              <p>For terms inquiries:</p>
              <a href="mailto:legal@tshortner.in">legal@tshortner.in</a>
            </div>
            <div className={styles.contactCard}>
              <h3>🛠️ Support Team</h3>
              <p>For general app inquiries:</p>
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
