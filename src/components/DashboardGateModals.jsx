import { useState } from 'react';
import styles from './DashboardGateModals.module.css';

export function normalizeTelegramUsername(raw) {
  let v = String(raw || '').trim();
  if (!v) return '';
  if (v.startsWith('@')) v = v.slice(1);
  v = v.replace(/\s+/g, '');
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(v)) return '';
  return v;
}

export default function DashboardGateModals({
  needsTelegram,
  telegramUsername,
  onSaveTelegram,
  showLinkiplayNotice,
  onDismissLinkiplay,
}) {
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!needsTelegram && !showLinkiplayNotice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = normalizeTelegramUsername(input);
    if (!normalized) {
      setError('Valid Telegram username daalo (3–32 chars, @ optional).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSaveTelegram(normalized);
    } catch (err) {
      setError(err?.message || 'Save failed. Dobara try karein.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} role="presentation">
      <div className={styles.stack}>
        {needsTelegram ? (
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tg-username-title"
          >
            <div className={styles.modalHeader}>
              <span className={styles.icon} aria-hidden>
                ✈️
              </span>
              <h2 id="tg-username-title">Telegram Username Required</h2>
            </div>
            <p className={styles.lead}>
              Aage badhne ke liye apna <strong>Telegram username</strong> zaroor daalo. Yeh sirf ek
              baar puchenge — database me save ho jayega.
            </p>
            {telegramUsername ? (
              <p className={styles.savedHint}>
                Saved: <strong>@{telegramUsername}</strong>
              </p>
            ) : null}
            <form onSubmit={handleSubmit} className={styles.form}>
              <label htmlFor="tgUsernameInput">Telegram username</label>
              <div className={styles.inputRow}>
                <span className={styles.at}>@</span>
                <input
                  id="tgUsernameInput"
                  type="text"
                  autoComplete="off"
                  placeholder="your_username"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
              {error ? <p className={styles.err}>{error}</p> : null}
              <button type="submit" className={styles.primaryBtn} disabled={saving}>
                {saving ? 'Saving…' : 'Save & Continue'}
              </button>
              <p className={styles.note}>Skip nahi hai — save ke baad hi dashboard khulega.</p>
            </form>
          </div>
        ) : null}

        {showLinkiplayNotice ? (
          <div className={styles.noticeModal} role="alertdialog" aria-labelledby="linkiplay-title">
            <div className={styles.noticeHeader}>
              <span className={styles.noticeIcon} aria-hidden>
                ⚠️
              </span>
              <h3 id="linkiplay-title">Important Notice</h3>
            </div>
            <p className={styles.noticeText}>
              <strong>Linkiplay temporarily ruk gaya hai.</strong> Team isko fix kar rahi hai. Tab
              tak kripya <strong>dhairya banaye rakhein</strong>.
            </p>
            <button type="button" className={styles.secondaryBtn} onClick={onDismissLinkiplay}>
              Samajh gaya
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
