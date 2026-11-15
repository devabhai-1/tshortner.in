import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span className={styles.footerCopyright}>
          &copy; {currentYear} TShortner. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
