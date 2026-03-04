import { Link } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import styles from './Support.module.css';

function SupportPublic() {
  const emailSupport = () => {
    const mail = "support@tshortner.in";
    const subject = encodeURIComponent("Support Request - TShortner");
    const body = encodeURIComponent(
      "Hi,\n\nMujhe panel me ek issue aa raha hai:\n\nDetails:\n- Email: \n- Problem: \n- Screenshot link (agar hai): \n\nThanks."
    );
    window.location.href = "mailto:" + mail + "?subject=" + subject + "&body=" + body;
  };

  const telegramSupport = () => {
    window.open("https://t.me/tshortner", "_blank");
  };

  return (
    <div className={styles.publicContainer}>
      <div className={styles.publicHeader}>
        <Link to="/" className={styles.backLink}>← Back to Home</Link>
        <h1>Support & Contact</h1>
        <p>Koi problem, question ya help chahiye? Yahan se direct contact karo.</p>
      </div>

      <div className={styles.mainInner}>
        {/* Support Cards */}
        <section className={styles.supportGrid}>
          {/* Email Support */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>📧 Email Support</div>
            <div className={styles.cardText}>
              Technical issue, payout doubt ya panel bug – sab detail me email bhej sakte ho.
              Screenshot attach karoge to aur easy ho jayega.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span className={styles.pill}>
                <span className={styles.pillDot}></span>
                support@tshortner.in
              </span>
            </div>
            <button className={styles.cardButton} onClick={emailSupport}>
              Open Email Client
            </button>
          </div>

          {/* Telegram Support */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>💬 Telegram Support</div>
            <div className={styles.cardText}>
              Fast response ke liye Telegram par message karo. 
              General questions, quick fixes, ya urgent issues ke liye best option.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span className={styles.pill}>
                <span className={styles.pillDot}></span>
                @tshortner
              </span>
            </div>
            <button className={styles.cardButton} onClick={telegramSupport}>
              Open Telegram
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          
          <div className={styles.faqItem}>
            <h3>How do I create an account?</h3>
            <p>
              Click on "Signup" or "Get Started" button on homepage. 
              You can sign up with email/password or use Google Sign-In for quick registration.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>How does earning work?</h3>
            <p>
              Earning is based on CPM (Cost Per Mille) - you earn for every 1000 valid impressions. 
              Rates vary by country and traffic quality. Check the CPM rates table on homepage.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>What is the minimum withdrawal amount?</h3>
            <p>
              Minimum withdrawal amount is $10.00 USD. You can withdraw via UPI (India) or Binance USDT (TRC20).
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>How long does payment processing take?</h3>
            <p>
              Payment processing usually takes 7-15 business days after withdrawal request is approved.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Can I use multiple accounts?</h3>
            <p>
              No, multiple accounts are not allowed. One account per person. 
              Violation may result in account suspension.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default SupportPublic;
