import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { emailToKey, saveWebLink, formatDateFromTs } from '../firebase/utils';
import Layout from '../components/Layout';
import styles from './Links.module.css';

function Links() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [webLinks, setWebLinks] = useState([]);
  const [telegramLinks, setTelegramLinks] = useState([]);
  
  // Form state
  const [webUrl, setWebUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Output state
  const [showOutput, setShowOutput] = useState(false);
  const [outputOriginal, setOutputOriginal] = useState('');
  const [outputShort, setOutputShort] = useState('');
  const [outputNote, setOutputNote] = useState('');
  const [lastShortUrlForCopy, setLastShortUrlForCopy] = useState('');

  const extractCodeFromUrl = (url) => {
    const match = url.match(/\/s\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const loadTelegramLinks = async (emailKey) => {
    const listRef = ref(db, 'users/' + emailKey + '/links/telegram/list');
    const snap = await get(listRef);

    if (!snap.exists()) {
      return [];
    }

    const data = snap.val() || {};
    const entries = Object.values(data);
    entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return entries;
  };

  const loadWebLinks = async (emailKey) => {
    const listRef = ref(db, 'users/' + emailKey + '/links/website/list');
    const snap = await get(listRef);

    if (!snap.exists()) {
      return [];
    }

    const data = snap.val() || {};
    const entries = Object.values(data);
    entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return entries;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;

      try {
        const emailKey = emailToKey(user.email);
        const [tgLinks, webLinksData] = await Promise.all([
          loadTelegramLinks(emailKey),
          loadWebLinks(emailKey)
        ]);

        setTelegramLinks(tgLinks);
        setWebLinks(webLinksData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUrlError('');

    const longUrl = webUrl.trim();
    if (!longUrl) {
      setUrlError('URL empty hai.');
      return;
    }

    const code = extractCodeFromUrl(longUrl);
    if (!code) {
      setUrlError('Is URL me /s/<id> nahi mila. Example: https://example.com/s/hjfvshgvgfgfggafs');
      return;
    }

    const shortUrl = `https://teraboxlinke.com/s/${code}`;
    setSubmitting(true);

    try {
      const emailKey = emailToKey(user.email);
      const { item, alreadyExists } = await saveWebLink(
        emailKey,
        user.email,
        longUrl,
        code,
        shortUrl
      );

      // Outputs - hamesha canonical existing item dikhayenge (EXACT same as HTML)
      setShowOutput(true);
      setOutputOriginal(item.originalUrl);
      setOutputShort(item.shortUrl);
      setLastShortUrlForCopy(item.shortUrl);

      if (alreadyExists) {
        // naya row add nahi karenge, count bhi same rahega (EXACT same as HTML)
        setOutputNote('Ye /s/' + code + ' pehle se saved hai, existing short link hi use ho raha hai.');
      } else {
        // table me new row add karo (prepend)
        setWebLinks(prev => [item, ...prev]);
        setOutputNote('');
      }

      setWebUrl('');
    } catch (err) {
      console.error(err);
      setUrlError('Link save karte waqt error: ' + (err.code || err.message));
    }

    setSubmitting(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert('Copied: ' + text),
      () => alert('Copy nahi ho paya, manually copy karein.')
    );
  };

  const copyShortOut = () => {
    if (!lastShortUrlForCopy) return;
    navigator.clipboard.writeText(lastShortUrlForCopy).then(
      () => alert('Short URL copied:\n' + lastShortUrlForCopy),
      () => alert('Copy nahi ho paya, manually copy karein.')
    );
  };

  const openBot = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Layout activeNav="links">
        <div className={styles.loading}>Loading links...</div>
      </Layout>
    );
  }

  return (
    <Layout activeNav="links">
      <div className={styles.mainInner}>
        {/* Title */}
        <div className={styles.pageTitle}>
          <div>
            <h1>Links</h1>
            <p>Yahin se tum Telegram bots + web shortner dono control karoge.</p>
          </div>
          <div className={styles.tagSmall}>
            <span className={styles.tagDot}></span>
            <span>Terabox ID → teraboxlinke.com</span>
          </div>
        </div>

        {/* Telegram Bots */}
        <section className={styles.card} style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.95rem' }}>Telegram Bots</h2>
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem' }}>
            In bots ke through tum Telegram par hi links bhejoge, aur ye panel ke iss account se linked rahenge.
          </p>

          <div className={styles.botGrid}>
            <div className={styles.botCard}>
              <h3>ShortEarn Bot #1</h3>
              <p>Basic shortener bot – jo bhi Terabox link milega usko is panel ke under track karega.</p>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => openBot('https://t.me/TShortnerbot')}
              >
                🤖 Open Bot 1
              </button>
            </div>

            <div className={styles.botCard}>
              <h3>ShortEarn Bot #2</h3>
              <p>High traffic / premium setup ke liye – multiple channels ya groups handle karne ke liye.</p>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => openBot('https://t.me/TShortner1bot')}
              >
                🤖 Open Bot 2
              </button>
            </div>
          </div>
        </section>

        {/* Web Shortner */}
        <section className={styles.card}>
          <h2 style={{ fontSize: '0.95rem', marginBottom: '0.7rem' }}>
            Web Shortner (Terabox ID Tracker)
          </h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="webUrl">Koi bhi link paste karo (Terabox ya koi bhi domain)</label>
              <input
                id="webUrl"
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://example.com/s/hjfvshgvgfgfggafs ya similar"
                required
              />
              <p className={styles.hintText}>
                System sirf URL ke andar ka <code>/s/yourID</code> part nikaalega aur
                usko <strong>https://teraboxlinke.com/s/yourID</strong> me convert karega.
              </p>
              {urlError && <p className={styles.errorText} style={{ display: 'block' }}>{urlError}</p>}
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              <span className={styles.icon}>⚡</span>
              <span>{submitting ? 'Saving...' : 'Generate & Save Short Link'}</span>
            </button>
          </form>

          {/* Outputs - EXACT same as HTML */}
          {showOutput && (
            <div className={styles.outputsGrid} style={{ display: 'grid' }}>
              <div className={styles.outputBox}>
                <div className={styles.outputLabel}>Original URL</div>
                <div className={styles.outputValue}>{outputOriginal}</div>
              </div>
              <div className={styles.outputBox}>
                <div className={styles.outputLabel}>Short URL (teraboxlinke.com)</div>
                <div className={styles.outputValue}>{outputShort}</div>
                <button
                  className={styles.copyMini}
                  type="button"
                  onClick={copyShortOut}
                >
                  Copy Short URL
                </button>
              </div>
            </div>
          )}
          {outputNote && <p className={styles.note}>{outputNote}</p>}
        </section>

        {/* Telegram Links Table */}
        <section>
          <div className={styles.sectionTitle}>
            <div>
              <h2>Saved Telegram Links</h2>
              <span>
                Ye links RTDB me <code>users/&lt;emailKey&gt;/links/telegram/list</code> me save hote hain.
              </span>
            </div>
            <span className={styles.badgeSoft}>{telegramLinks.length} links</span>
          </div>

          <div className={styles.card}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Short URL</th>
                    <th>Original URL</th>
                    <th>Code</th>
                    <th>Clicks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {telegramLinks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className={styles.textSoft}>
                        Abhi tak koi telegram link save nahi hua.
                      </td>
                    </tr>
                  ) : (
                    telegramLinks.map((item) => (
                      <tr key={item.id || item.createdAt}>
                        <td>{formatDateFromTs(item.createdAt || Date.now())}</td>
                        <td><span className={styles.urlShort}>{item.shortUrl || 'N/A'}</span></td>
                        <td><span className={styles.urlMain} title={item.originalUrl}>{item.originalUrl || 'N/A'}</span></td>
                        <td>{item.code || 'N/A'}</td>
                        <td>{item.clicks || 0}</td>
                        <td>
                          <button className={styles.btnXs} onClick={() => copyToClipboard(item.shortUrl || '')}>Copy</button>
                          <button className={styles.btnXs} onClick={() => window.open(item.shortUrl || '', '_blank')}>Open</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.note}>
              {telegramLinks.length > 0 
                ? `Latest ${telegramLinks.length} telegram links.`
                : 'Abhi tak koi telegram link save nahi hua.'}
            </p>
          </div>
        </section>

        {/* Web Links Table */}
        <section>
          <div className={styles.sectionTitle}>
            <div>
              <h2>Saved Web Links</h2>
              <span>
                Ye links RTDB me <code>users/&lt;emailKey&gt;/links/website/list</code>
                + global <code>allLinks/&lt;code&gt;</code> me save hote hain.
              </span>
            </div>
            <span className={styles.badgeSoft}>{webLinks.length} links</span>
          </div>

          <div className={styles.card}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Short URL</th>
                    <th>Original URL</th>
                    <th>Code</th>
                    <th>Clicks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webLinks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className={styles.textSoft}>
                        Abhi tak koi web short link save nahi hua.
                      </td>
                    </tr>
                  ) : (
                    webLinks.map((item) => (
                      <tr key={item.id || item.createdAt}>
                        <td>{formatDateFromTs(item.createdAt || Date.now())}</td>
                        <td><span className={styles.urlShort}>{item.shortUrl}</span></td>
                        <td><span className={styles.urlMain} title={item.originalUrl}>{item.originalUrl}</span></td>
                        <td>{item.code}</td>
                        <td>{item.clicks || 0}</td>
                        <td>
                          <button className={styles.btnXs} onClick={() => copyToClipboard(item.shortUrl)}>Copy</button>
                          <button className={styles.btnXs} onClick={() => window.open(item.shortUrl, '_blank')}>Open</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.note}>
              {webLinks.length > 0 
                ? `Latest ${webLinks.length} web links.`
                : 'Abhi tak koi web short link save nahi hua.'}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Links;
