import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

function Home() {
  const { user, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auth state watcher - redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const showMsg = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMsg('');
    
    try {
      const result = await googleLogin();
      if (result.mode === 'new') {
        showMsg('Account created successfully! Dashboard open ho raha hai...', 'success');
      } else {
        showMsg('Account loaded successfully! Dashboard open ho raha hai...', 'success');
      }
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Google login error:', err);
      let errorMsg = 'Google login fail ho gaya.';
      if (err.code === 'auth/unauthorized-domain') {
        errorMsg = 'Firebase Authentication → Settings → Authorized domains me apna domain add karo.';
      }
      showMsg(errorMsg, 'error');
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}></div>
            <div>
              <div className={styles.brandTextMain}>TShortner</div>
              <div className={styles.brandTextSub}>Smart URL &amp; Earning Panel</div>
            </div>
          </div>

          <nav className={styles.topNavLinks}>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
            <Link to="/dashboard" className={styles.navCta}>
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <div className={styles.heroInner}>
          <p className={styles.heroBrand}>TShortner</p>
          <h1 className={styles.heroTitle}>Traffic ko tracked earning me badlo</h1>
          <p className={styles.heroText}>
            Short links, live stats, aur wallet — ek panel se. Share karo, clicks track
            hote hain, payout clear rehta hai.
          </p>

          <div className={styles.heroCtas}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGoogle} ${styles.heroGoogle}`}
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              <span className={styles.g}>G</span>
              <span>{googleLoading ? 'Connecting…' : 'Continue with Google'}</span>
            </button>
            <div className={styles.heroSecondary}>
              <Link to="/login" className={`${styles.btnLink} ${styles.btn} ${styles.btnPrimary}`}>
                Login
              </Link>
              <Link to="/signup" className={`${styles.btnLink} ${styles.btn} ${styles.btnOutline}`}>
                Create account
              </Link>
            </div>
          </div>

          {msg ? (
            <div
              className={`${styles.msg} ${msgType === 'error' ? styles.error : styles.success}`}
            >
              {msg}
            </div>
          ) : null}

          <p className={styles.heroMini}>
            Google se pehli baar login = account auto create. Purana data same email pe load
            hota hai.
          </p>
        </div>
      </section>

      <section className={styles.infoSectionWrapper}>
        <div>
          <h2 className={styles.infoSectionTitle}>Shortner Kya Hai?</h2>
          <p className={styles.infoSectionSubtitle}>
            Long URLs ko short, trackable aur earning wale links me convert karein. Ek
            panel se Telegram, WhatsApp, website — sab control.
          </p>
        </div>

        <div className={styles.infoSectionGrid}>
          <div className={styles.infoCard}>
            <h2>Shortner Kaise Kaam Karta Hai?</h2>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Long URL Dalte Hain</h3>
                <p>
                  Aap apna long URL (movie link, file link, Terabox link, ya koi bhi link)
                  paste karte hain.
                </p>
              </div>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Short Link Generate Hota Hai</h3>
                <p>
                  System automatically ek <strong>chhota, clean short link</strong> bana deta
                  hai jo share karna easy hota hai.
                </p>
              </div>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Track &amp; Redirect</h3>
                <p>
                  Click par system pehle <strong>impression track</strong> karta hai, phir
                  original URL par redirect.
                </p>
              </div>
            </div>

            <div className={styles.benefitsSection}>
              <h3 className={styles.benefitsTitle}>Kyun Use Karein?</h3>
              <ul className={styles.infoList}>
                <li>Clean short links</li>
                <li>Har click ka record</li>
                <li>Real-time dashboard</li>
                <li>Source-wise performance</li>
                <li>Fast &amp; secure</li>
              </ul>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h2>Earning System</h2>

            <div className={styles.earningExplanation}>
              <p>
                <strong>CPM</strong> ke base par earning —{' '}
                <strong>har 1000 valid views</strong> par payout.
              </p>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Click Track</h3>
                <p>User short link par click karta hai — system track karta hai.</p>
              </div>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Impression Count</h3>
                <p>Valid traffic count; fake / bot filter.</p>
              </div>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Earning Add</h3>
                <p>
                  Valid impressions earning me add — daily / total / CPM dashboard me clear.
                </p>
              </div>
            </div>

            <div className={styles.benefitsSection}>
              <h3 className={styles.benefitsTitle}>Important</h3>
              <ul className={styles.infoList}>
                <li>Sirf valid traffic</li>
                <li>CPM quality pe depend</li>
                <li>Live stats</li>
                <li>Quality = stable earn</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CPM Rates by Country */}
      <section className={styles.cpmSection}>
        <div className={styles.cpmHeader}>
          <h2 className={styles.cpmTitle}>Country-wise CPM Rates</h2>
          <p className={styles.cpmSubtitle}>
            Har country ke liye CPM rate alag hoti hai. Quality traffic aur country ke base par rates decide hote hain.
          </p>
        </div>

        <div className={styles.cpmTableWrapper}>
          <table className={styles.cpmTable}>
            <thead>
              <tr>
                <th>Country</th>
                <th>CPM Rate (USD)</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🇺🇸 United States</td>
                <td className={styles.cpmHigh}>$8.50 - $12.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierPremium}>Premium</span></td>
              </tr>
              <tr>
                <td>🇬🇧 United Kingdom</td>
                <td className={styles.cpmHigh}>$7.00 - $10.50</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierPremium}>Premium</span></td>
              </tr>
              <tr>
                <td>🇨🇦 Canada</td>
                <td className={styles.cpmHigh}>$6.50 - $9.50</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierPremium}>Premium</span></td>
              </tr>
              <tr>
                <td>🇦🇺 Australia</td>
                <td className={styles.cpmHigh}>$6.00 - $9.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierPremium}>Premium</span></td>
              </tr>
              <tr>
                <td>🇩🇪 Germany</td>
                <td className={styles.cpmMedium}>$5.50 - $8.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierHigh}>High</span></td>
              </tr>
              <tr>
                <td>🇫🇷 France</td>
                <td className={styles.cpmMedium}>$5.00 - $7.50</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierHigh}>High</span></td>
              </tr>
              <tr>
                <td>🇳🇱 Netherlands</td>
                <td className={styles.cpmMedium}>$4.50 - $7.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierHigh}>High</span></td>
              </tr>
              <tr>
                <td>🇸🇪 Sweden</td>
                <td className={styles.cpmMedium}>$4.50 - $7.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierHigh}>High</span></td>
              </tr>
              <tr>
                <td>🇯🇵 Japan</td>
                <td className={styles.cpmMedium}>$4.00 - $6.50</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierHigh}>High</span></td>
              </tr>
              <tr>
                <td>🇸🇬 Singapore</td>
                <td className={styles.cpmMedium}>$4.00 - $6.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierHigh}>High</span></td>
              </tr>
              <tr>
                <td>🇮🇹 Italy</td>
                <td className={styles.cpmMedium}>$3.50 - $5.50</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierMedium}>Medium</span></td>
              </tr>
              <tr>
                <td>🇪🇸 Spain</td>
                <td className={styles.cpmMedium}>$3.50 - $5.50</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierMedium}>Medium</span></td>
              </tr>
              <tr>
                <td>🇮🇳 India</td>
                <td className={styles.cpmLow}>$1.50 - $3.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierMedium}>Medium</span></td>
              </tr>
              <tr>
                <td>🇧🇷 Brazil</td>
                <td className={styles.cpmLow}>$1.20 - $2.50</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierMedium}>Medium</span></td>
              </tr>
              <tr>
                <td>🇲🇽 Mexico</td>
                <td className={styles.cpmLow}>$1.00 - $2.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierStandard}>Standard</span></td>
              </tr>
              <tr>
                <td>🇵🇭 Philippines</td>
                <td className={styles.cpmLow}>$0.80 - $1.80</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierStandard}>Standard</span></td>
              </tr>
              <tr>
                <td>🇻🇳 Vietnam</td>
                <td className={styles.cpmLow}>$0.70 - $1.50</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierStandard}>Standard</span></td>
              </tr>
              <tr>
                <td>🇮🇩 Indonesia</td>
                <td className={styles.cpmLow}>$0.60 - $1.20</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierStandard}>Standard</span></td>
              </tr>
              <tr>
                <td>🇵🇰 Pakistan</td>
                <td className={styles.cpmLow}>$0.50 - $1.00</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierStandard}>Standard</span></td>
              </tr>
              <tr>
                <td>🇧🇩 Bangladesh</td>
                <td className={styles.cpmLow}>$0.40 - $0.80</td>
                <td><span className={styles.tierBadge + ' ' + styles.tierStandard}>Standard</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.cpmNote}>
          <p>
            <strong>Note:</strong> Ye rates approximate hain aur quality, traffic source, aur performance ke base par vary kar sakte hain. 
            Actual rates account performance aur traffic quality ke hisab se decide hote hain.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.miniFooter}>
        © <span>{new Date().getFullYear()}</span> TShortner
        <div style={{ marginTop: '0.5rem' }}>
          <Link to="/privacy">Privacy Policy</Link> •
          <Link to="/terms">Terms & Conditions</Link>
        </div>
        <div className={styles.footerSmallText}>
          Safe short-link panel — quality traffic only.
        </div>
      </footer>
    </div>
  );
}

export default Home;
