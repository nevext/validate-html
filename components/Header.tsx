import Link from "next/link";
import Button from "./Button";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.siteHeader}>
      <div className={`${styles.headerCard} container`}>
        <div className={styles.brandSmall}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.brandText}>BEM VINDO AO VALIDATE</span>
          </Link>
        </div>
        <nav className={styles.linkGroup}>
          <a href="https://github.com/nevext" target="_blank" rel="noopener">
            github
          </a>
          <Link href="/dashboard">dashboard</Link>
        </nav>
        <div className={styles.buttonGroup}>
          <Button href="/create">Criar projeto</Button>
        </div>
      </div>
    </header>
  );
}
