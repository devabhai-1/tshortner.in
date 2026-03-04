import Navbar from './Navbar';
import styles from './Layout.module.css';

function Layout({ children, subtitle }) {
  return (
    <div className={styles.layout}>
      <Navbar subtitle={subtitle} />
      <main className={styles.main}>
        <div className={styles.mainInner}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
