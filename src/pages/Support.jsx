import Layout from '../components/Layout';
import styles from './Support.module.css';

function Support() {
  const emailSupport = () => {
    const mail = "support@shortnerpanel.com";
    const subject = encodeURIComponent("Support Request - Shortner Panel");
    const body = encodeURIComponent(
      "Hi,\n\nMujhe panel me ek issue aa raha hai:\n\nDetails:\n- Email: \n- Problem: \n- Screenshot link (agar hai): \n\nThanks."
    );
    window.location.href = "mailto:" + mail + "?subject=" + subject + "&body=" + body;
  };

  const telegramSupport = () => {
    // apna real telegram bot / ID ka link yahan lagao
    window.open("https://t.me/YourSupportBot", "_blank");
  };

  const openLink = (url) => {
    window.open(url, "_blank");
  };

  return (
    <Layout activeNav="support">
      <div className={styles.mainInner}>
        {/* Title */}
        <div className={styles.pageTitle}>
          <div>
            <h1>Support</h1>
            <p>Koi problem, payout issue ya integration help chahiye? Yahan se direct contact karo.</p>
          </div>
          <div className={styles.tagSmall}>
            <span className={styles.tagDot}></span>
            <span>Average reply: 24 hours</span>
          </div>
        </div>

        {/* TOP SUPPORT CARDS: Email / Telegram / Social */}
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
                support@shortnerpanel.com
              </span>
            </div>
            <button className={styles.btnPrimary} type="button" onClick={emailSupport}>
              <span>Write an Email</span>
            </button>
          </div>

          {/* Telegram Support */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>🤖 Telegram Support</div>
            <div className={styles.cardText}>
              Fast reply ke liye Telegram best hai. Yahan se direct bot / ID pe message bhej sakte ho.
            </div>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              Telegram ID: <span style={{ color: '#a5b4fc', fontWeight: '500' }}>@TShortner_team</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
              Message me apna <b>panel email</b> aur problem ka short description zaroor likho.
            </div>
            <button className={styles.btnPrimary} type="button" onClick={telegramSupport}>
              <span>Open Telegram</span>
            </button>
          </div>

          {/* Social Buttons */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>🌐 Social & Updates</div>
            <div className={styles.cardText}>
              Naye updates, maintenance notice, CPM changes – sab yahan announce honge.
            </div>

            <div>
              <button className={styles.btnOutline} type="button" onClick={() => openLink('https://t.me/TShortner_team')}>
                📣 Telegram Channel
              </button>
              <button className={styles.btnOutline} type="button" onClick={() => openLink('https://youtube.com/')}>
                ▶️ YouTube
              </button>
              <button className={styles.btnOutline} type="button" onClick={() => openLink('https://x.com/')}>
                ✖ X (Twitter)
              </button>
              <button className={styles.btnOutline} type="button" onClick={() => openLink('https://instagram.com/')}>
                📸 Instagram
              </button>
            </div>

            <p className={styles.note}>
              Links abhi dummy hain – apne real channel / social URLs yahan dal dena.
            </p>
          </div>
        </section>

        {/* ONLY FAQ CARD */}
        <section className={styles.card}>
          <h2 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Quick FAQ</h2>

          <div className={styles.faqItem}>
            <div className={styles.faqQ}>Q. Reply time kitna hota hai?</div>
            <div className={styles.faqA}>
              Normally 24 hours ke andar reply mil jata hai. Heavy load ke time pe 48 hours tak lag sakta hai.
            </div>
          </div>

          <div className={styles.faqItem}>
            <div className={styles.faqQ}>Q. Payment support ke liye kya data bhejna hai?</div>
            <div className={styles.faqA}>
              Date, expected amount (USD), payment method (UPI / Binance), aur panel email zaroor likho.
              Agar screenshot ho to aur fast verification ho jayegi.
            </div>
          </div>

          <div className={styles.faqItem}>
            <div className={styles.faqQ}>Q. Telegram pe sirf message karna enough hai?</div>
            <div className={styles.faqA}>
              Haan, bas message me apna panel email + issue detail likhna mat bhoolna.
              Agar urgent ho to subject me "URGENT" likh sakte ho.
            </div>
          </div>

          <div className={styles.faqItem}>
            <div className={styles.faqQ}>Q. Account ban problem ya login issue?</div>
            <div className={styles.faqA}>
              Email support best hai, kyunki waha hum properly logs, IP details, device info check kar pate hain.
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Support;
