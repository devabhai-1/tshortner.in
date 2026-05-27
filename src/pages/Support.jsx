import Layout from '../components/Layout';
import styles from './Support.module.css';

function Support() {
  const telegramSupport = () => {
    window.open('https://t.me/TShortner_team', '_blank', 'noopener,noreferrer');
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

        {/* TOP SUPPORT CARDS: Telegram help + updates channel */}
        <section className={styles.supportGrid}>
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

          {/* Official updates — Telegram channel only */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>📣 Channel &amp; updates</div>
            <div className={styles.cardText}>
              Naye updates, maintenance notice aur CPM changes sirf is Telegram channel par announce honge.
              Channel join karke notifications on rakho.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span className={styles.pill}>
                <span className={styles.pillDot}></span>
                t.me/Tshortner
              </span>
            </div>
            <button
              className={styles.btnPrimary}
              type="button"
              onClick={() => window.open('https://t.me/Tshortner', '_blank', 'noopener,noreferrer')}
            >
              <span>Telegram channel kholen</span>
            </button>
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
              Telegram par apna panel email, last login time aur error ka screenshot bhejo — team logs aur device
              side se help kar degi.
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Support;
