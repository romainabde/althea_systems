import Link from "next/link";
import styles from "./DesktopFooter.module.css";

export default function DesktopFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <h3 className={styles.brand}>Althea Systems</h3>
          <p className={styles.copyright}>© 2026 Althea Systems. Tous droits réservés.</p>
        </div>

        <nav className={styles.links} aria-label="Liens footer">
          <Link href="#" className={styles.link}>
            Mentions légales
          </Link>
          <Link href="#" className={styles.link}>
            CGU
          </Link>
          <Link href="#" className={styles.link}>
            Contact
          </Link>
        </nav>

        <div className={styles.socials}>
          <span className={styles.socialLabel}>Réseaux sociaux</span>
          <div className={styles.socialLinks}>
            <Link href="#" className={styles.link}>
              LinkedIn
            </Link>
            <Link href="#" className={styles.link}>
              Instagram
            </Link>
            <Link href="#" className={styles.link}>
              Facebook
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
