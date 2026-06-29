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
  showMaintenanceNotice,
  onDismissMaintenance,
}) {
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!needsTelegram && !showMaintenanceNotice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = normalizeTelegramUsername(input);
    if (!normalized) {
      setError('Enter a valid Telegram username (3–32 characters; @ is optional).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSaveTelegram(normalized);
    } catch (err) {
      setError(err?.message || 'Unable to save. Please try again.');
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
              To continue, please provide your <strong>Telegram username</strong>. This is a
              one-time setup and will be linked to your account for support and updates.
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
              <p className={styles.note}>
                This step is required. Dashboard access will be enabled after you save.
              </p>
            </form>
          </div>
        ) : null}

        {showMaintenanceNotice ? (
          <div className={styles.noticeModal} role="alertdialog" aria-labelledby="maintenance-title">
            <div className={styles.noticeHeader}>
              <span className={styles.noticeIcon} aria-hidden>
                ⚠️
              </span>
              <h3 id="maintenance-title">TShortner — Service Update</h3>
            </div>

            <div className={styles.noticeBlock}>
              <p className={styles.noticeLang}>English</p>
              <p className={styles.noticeText}>
                <strong>TShortner is temporarily down from 28th, 8 PM onwards.</strong> We are
                working to restore it.
              </p>
              <p className={styles.noticeText}>
                The service is expected to be back within <strong>2–3 days</strong>. Thank you for
                your patience.
              </p>
            </div>

            <div className={styles.noticeDivider} aria-hidden />

            <div className={styles.noticeBlock}>
              <p className={styles.noticeLang}>हिंदी</p>
              <p className={styles.noticeText}>
                <strong>TShortner 28 tarik ko 8 PM se aage band hai.</strong> Hum ise dobara chalu
                karne par kaam kar rahe hain.
              </p>
              <p className={styles.noticeText}>
                Ab <strong>2–3 din</strong> me vapas chalne ki umid rahegi. Aapke dhairya ke liye
                dhanyawad.
              </p>
            </div>

            <button type="button" className={styles.secondaryBtn} onClick={onDismissMaintenance}>
              Got it / Samajh gaya
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
