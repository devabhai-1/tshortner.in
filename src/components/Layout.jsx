import Navbar from './Navbar';
import FloatingBottomNav from './FloatingBottomNav';
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
      <FloatingBottomNav />
    </div>
  );
}

export default Layout;
