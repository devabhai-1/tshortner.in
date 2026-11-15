import Navbar from './Navbar';
import FloatingBottomNav from './FloatingBottomNav';
import Footer from './footer/Footer';
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
      <Footer />
    </div>
  );
}

export default Layout;
