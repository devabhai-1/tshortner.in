import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './PlayerLegal.module.css';

export default function PlayerContact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Bug Report', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span>📱</span> T-Player Support & Contact
        </div>

        <h1>Contact Us — T-Player Support</h1>
        <p className={styles.lastUpdated}>
          Official Support Channel for <strong>T-Player</strong> &bull; Package: <code>in.tshortner.t_player</code>
        </p>

        {/* Tab Navigation for Player Legal */}
        <div className={styles.tabNav}>
          <Link to="/player/privacy" className={styles.tabLink}>
            🔒 Privacy Policy
          </Link>
          <Link to="/player/terms" className={styles.tabLink}>
            📜 Terms of Service
          </Link>
          <Link to="/player/contact" className={`${styles.tabLink} ${styles.activeTab}`}>
            ✉️ Contact Us
          </Link>
        </div>

        <section>
          <h2>Direct Contact Channels</h2>
          <p>
            Have a question, feedback, or need help troubleshooting T-Player? Our developer support team is here to assist you:
          </p>

          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h3>📧 App Support Email</h3>
              <p>For technical help, bug reports, and features:</p>
              <a href="mailto:support@tshortner.in">support@tshortner.in</a>
            </div>

            <div className={styles.contactCard}>
              <h3>🔒 Privacy Officer</h3>
              <p>For data privacy and permissions questions:</p>
              <a href="mailto:privacy@tshortner.in">privacy@tshortner.in</a>
            </div>

            <div className={styles.contactCard}>
              <h3>💬 Telegram Community</h3>
              <p>For instant updates and community help:</p>
              <a href="https://t.me/tshortner_bot" target="_blank" rel="noopener noreferrer">
                @tshortner_bot
              </a>
            </div>

            <div className={styles.contactCard}>
              <h3>⏱️ Response Time</h3>
              <p>Support operating hours:</p>
              <span style={{ color: '#FFC400', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Within 24 - 48 Hours
              </span>
            </div>
          </div>
        </section>

        {/* Interactive Feedback / Bug Report Box */}
        <section>
          <h2>Send Developer a Message</h2>
          {submitted ? (
            <div className={styles.highlightBox} style={{ borderColor: '#10B981', background: 'rgba(16, 185, 129, 0.1)' }}>
              <p style={{ color: '#10B981', fontWeight: 'bold' }}>
                ✅ Thank you for contacting T-Player support! Your message has been received. Our team will review your report shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8C96A5', marginBottom: '6px' }}>Your Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g. Dev"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8C96A5', marginBottom: '6px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="yourname@gmail.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8C96A5', marginBottom: '6px' }}>Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#161B22',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="Bug Report">🐛 Bug Report / Crash</option>
                  <option value="Feature Request">💡 Feature Request / Improvement</option>
                  <option value="Format Support">🎬 New File Format Support</option>
                  <option value="Privacy Question">🔒 Privacy / Permissions Question</option>
                  <option value="Other">💬 General Inquiry</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8C96A5', marginBottom: '6px' }}>Message Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue or feedback in detail (e.g. phone model, video format)..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: '#FFC400',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                Send Message &rarr;
              </button>
            </form>
          )}
        </section>

        {/* Frequently Asked Questions */}
        <section>
          <h2>Frequently Asked Questions</h2>
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#FFF', marginBottom: '4px' }}>
              Q: Why does T-Player need Storage & Media permissions?
            </h3>
            <p>
              T-Player is an on-device player. It needs media permissions solely to scan and list videos, photos, and music saved on your phone storage so you can watch them without uploading anything.
            </p>

            <h3 style={{ fontSize: '1rem', color: '#FFF', marginBottom: '4px', marginTop: '1rem' }}>
              Q: Does T-Player upload my private photos or videos?
            </h3>
            <p>
              <strong>Never.</strong> T-Player operates completely offline for local media. Your personal files never leave your device.
            </p>

            <h3 style={{ fontSize: '1rem', color: '#FFF', marginBottom: '4px', marginTop: '1rem' }}>
              Q: How do I stream a Terabox or web video URL?
            </h3>
            <p>
              Simply open the &ldquo;Stream URL&rdquo; tab at the bottom, enter your direct video or stream URL, and tap &ldquo;Open / Load&rdquo;.
            </p>
          </div>
        </section>

        <Link to="/" className={styles.backHome}>
          &larr; Back to TShortner Home
        </Link>
      </div>
    </div>
  );
}
