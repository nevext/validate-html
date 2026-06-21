"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import Button from "./Button";
import SignOutButton from "./SignOutButton";
import styles from "./Header.module.css";

export default function Header() {
  const { user, loading } = useAuth();

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
          {user && <span className={styles.userName}>{user.displayName}</span>}
        </nav>
        <div className={styles.buttonGroup}>
          {!loading &&
            (user ? (
              <>
                <Button href="/create">Criar projeto</Button>
                <SignOutButton />
              </>
            ) : (
              <>
                <Button href="/login" variant="secondary">
                  Entrar
                </Button>
                <Button href="/signup">Cadastrar</Button>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
