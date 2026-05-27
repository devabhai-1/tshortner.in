import { Link } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import styles from './Terms.module.css';

function Terms() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last Updated: January 3, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            Shortner Panel use karke tum in terms ko accept kar rahe ho. Agar agree
            nahi ho to service use mat karo.
          </p>
        </section>

        <section>
          <h2>2. Service Description</h2>
          <p>
            Shortner Panel ek URL shortening aur earning platform hai. Tum links
            shorten kar sakte ho aur impressions ke basis pe earning kar sakte ho.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <p>Tum responsible ho:</p>
          <ul>
            <li>Apne account credentials ko secure rakhne ke liye</li>
            <li>Only legal aur appropriate content share karne ke liye</li>
            <li>Spam, fraud, ya illegal activities se bachne ke liye</li>
            <li>Platform rules aur guidelines follow karne ke liye</li>
            <li>Accurate payment information provide karne ke liye</li>
          </ul>
        </section>

        <section>
          <h2>4. Prohibited Activities</h2>
          <p>Ye activities strictly prohibited hain:</p>
          <ul>
            <li>Adult, illegal, ya offensive content ka promotion</li>
            <li>Fake clicks ya traffic generation</li>
            <li>Multiple accounts banake system abuse karna</li>
            <li>Malware, viruses, ya harmful links share karna</li>
            <li>Platform vulnerabilities ko exploit karna</li>
            <li>Copyrighted content ka unauthorized distribution</li>
          </ul>
        </section>

        <section>
          <h2>5. Earnings & Payments</h2>
          <ul>
            <li>Minimum payout: $10.00 USD</li>
            <li>Payment methods: UPI (India), Binance USDT (TRC20)</li>
            <li>Earnings CPM basis pe calculate hote hain</li>
            <li>Payment processing time: 7-15 business days</li>
            <li>Fraudulent activity detect hone par earnings forfeit ho sakti hain</li>
          </ul>
        </section>

        <section>
          <h2>6. Account Suspension & Termination</h2>
          <p>
            Hum kisi bhi account ko suspend ya terminate kar sakte hain agar:
          </p>
          <ul>
            <li>Terms of Service violate ho</li>
            <li>Fraudulent activity detect ho</li>
            <li>Multiple rule violations ho</li>
            <li>Legal issues arise ho</li>
          </ul>
          <p>
            Suspended accounts ka pending balance forfeit ho sakta hai.
          </p>
        </section>

        <section>
          <h2>7. Service Availability</h2>
          <p>
            Hum try karte hain 24/7 uptime maintain karne ki, lekin maintenance,
            updates, ya technical issues ke wajah se downtime ho sakta hai. Hum
            is downtime ke liye responsible nahi hain.
          </p>
        </section>

        <section>
          <h2>8. Changes to Terms</h2>
          <p>
            Hum ye terms kabhi bhi update kar sakte hain. Major changes ke liye
            email notification bhejenge. Continued use matlab terms accept karna.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            Shortner Panel "as is" provide kiya jata hai. Hum data loss, revenue
            loss, ya kisi bhi indirect damages ke liye liable nahi hain.
          </p>
        </section>

        <section>
          <h2>10. Contact & Dispute Resolution</h2>
          <p>
            Questions ya disputes ke liye contact karo:<br />
            Email: support@example.com<br />
            Telegram: @your_support_channel
          </p>
          <p>
            Serious disputes arbitration ke through resolve honge.
          </p>
        </section>

      </div>
      <Footer />
    </div>
  );
}

export default Terms;
