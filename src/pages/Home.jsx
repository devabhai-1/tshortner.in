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
      {/* Top Navbar */}
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
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
            <Link to="/dashboard" className={styles.navCta}>Open Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Top Intro Text */}
      <section className={styles.topIntro}>
        <h2 className={styles.topIntroTitle}>Apne traffic ko real earning me convert karo</h2>
        <p className={styles.topIntroText}>
          TShortner aapke long links ko ek organized earning system banata hai –
          jahan har click track hota hai, stats clear hote hain, aur sab kuch ek hi panel se control hota hai.
        </p>
      </section>

      {/* TOP LOGIN CARD */}
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span>S</span>
          </div>

          <h1>Shortner Panel</h1>
          <p className={styles.subtitle}>
            Apne लंबे links ko short karo, track karo aur earning manage karo – sab yahi se.
          </p>

          <div className={styles.btnGroup}>
            <Link to="/login" className={`${styles.btnLink} ${styles.btn} ${styles.btnPrimary}`}>
              🔐 Login
            </Link>
            <Link to="/signup" className={`${styles.btnLink} ${styles.btn} ${styles.btnOutline}`}>
              ✨ Create Account
            </Link>

            <button 
              type="button" 
              className={`${styles.btn} ${styles.btnGoogle}`}
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              <span className={styles.g}>G</span>
              <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>

          {msg && (
            <div className={`${styles.msg} ${msgType === 'error' ? styles.error : styles.success}`}>
              {msg}
            </div>
          )}

          <p className={styles.miniText}>
            Google se login karoge to email select karte hi account create ho jayega
            (agar pehle nahi bana). Agar pehle se data hai to wahi load hoga.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <section className={styles.infoSectionWrapper}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div className={styles.btnGroup} style={{ justifyContent: 'center', gap: '1rem', flexDirection: 'row', flexWrap: 'wrap' }}>
            <Link to="/signup" className={`${styles.btnLink} ${styles.btn} ${styles.btnPrimary}`} style={{ padding: '1.2rem 2.5rem', fontSize: '1.15rem', fontWeight: '700' }}>
              ✨ Create Account
            </Link>
            <Link to="/login" className={`${styles.btnLink} ${styles.btn} ${styles.btnOutline}`} style={{ padding: '1.2rem 2.5rem', fontSize: '1.15rem', fontWeight: '700' }}>
              🔐 Login
            </Link>
          </div>
        </div>
        <div>
          <h2 className={styles.infoSectionTitle}>Shortner Kya Hai?</h2>
          <p className={styles.infoSectionSubtitle}>
            Long URLs ko short, trackable aur earning wale links me convert karein. 
            Ek centralized panel se sab control karein – Telegram, WhatsApp, website, social media sabke liye.
          </p>
        </div>

        <div className={styles.infoSectionGrid}>
          {/* Left Section - Concept */}
          <div className={styles.infoCard}>
            <h2>📌 Shortner Kaise Kaam Karta Hai?</h2>
            
            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Long URL Dalte Hain</h3>
                <p>
                  Aap apna long URL (movie link, file link, Terabox link, ya koi bhi link) paste karte hain.
                </p>
              </div>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Short Link Generate Hota Hai</h3>
                <p>
                  System automatically ek <strong>chhota, clean aur branded short link</strong> bana deta hai 
                  jo professional lagta hai aur share karna easy hota hai.
                </p>
              </div>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Track &amp; Redirect</h3>
                <p>
                  Jab koi user short link par click karta hai, system pehle 
                  <strong> impression aur click track</strong> karta hai, phir user ko original URL par safely redirect kar deta hai.
                </p>
              </div>
            </div>

            <div className={styles.benefitsSection}>
              <h3 className={styles.benefitsTitle}>Kyun Use Karein?</h3>
              <ul className={styles.infoList}>
                <li>Clean &amp; Professional Short Links</li>
                <li>Har Click ka Complete Record</li>
                <li>Real-time Stats Dashboard</li>
                <li>Alag Sources ke Performance Track</li>
                <li>Secure &amp; Fast Backend</li>
              </ul>
            </div>

            <div className={styles.infoHighlightBox}>
              <span>Key Point:</span> Long URLs ugly lagte hain, track nahi hote. 
              Shortner se aapke links professional ban jate hain aur har click properly track hota hai.
            </div>
          </div>

          {/* Right Section - Earning */}
          <div className={styles.infoCard}>
            <h2>💰 Earning System</h2>
            
            <div className={styles.earningExplanation}>
              <p>
                <strong>CPM (Cost Per Mille)</strong> ke base par earning hoti hai. 
                Simple me: <strong>har 1000 valid views par aapko payout milta hai.</strong>
              </p>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Click Track</h3>
                <p>
                  User aapke short link par click karta hai. System automatically track karta hai.
                </p>
              </div>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Impression Count</h3>
                <p>
                  Valid traffic (real users) ko count kiya jata hai. 
                  Fake, bot, ya invalid traffic filter ho jata hai.
                </p>
              </div>
            </div>

            <div className={styles.conceptStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Earning Add</h3>
                <p>
                  Har valid impression aapki earning me add hota hai. 
                  Dashboard me <strong>daily earning, total earning, CPM</strong> sab clearly dikhta hai.
                </p>
              </div>
            </div>

            <div className={styles.benefitsSection}>
              <h3 className={styles.benefitsTitle}>Important Points</h3>
              <ul className={styles.infoList}>
                <li>Sirf Valid Traffic Count Hoti Hai</li>
                <li>CPM Rate Quality ke Base Par Hoti Hai</li>
                <li>Real-time Dashboard me Sab Stats</li>
                <li>Quality Traffic = Stable Earning</li>
                <li>Long-term Earning Possible</li>
              </ul>
            </div>

            <div className={styles.infoHighlightBox}>
              <span>Tip:</span> Quality traffic lao – slow &amp; steady growth se account safe rahega 
              aur earning stable &amp; long-term banegi.
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
        © <span>{new Date().getFullYear()}</span> Shortner Panel
        <div style={{ marginTop: '0.5rem' }}>
          <Link to="/privacy">Privacy Policy</Link> •
          <Link to="/terms">Terms & Conditions</Link>
        </div>
        <div className={styles.footerSmallText}>
          Safe & Legal Short-Link Platform – High Quality Traffic Only.
        </div>
      </footer>
    </div>
  );
}

export default Home;
