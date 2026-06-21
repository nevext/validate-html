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
            <span className={styles.brandText}>VALIDATE</span>
          </Link>
        </div>
        <nav className={styles.linkGroup}>
          <Link href="/#sobre">sobre</Link>
          <Link href="/privacidade">política de privacidade</Link>
        </nav>
        <div className={styles.buttonGroup}>
          {!loading &&
            (user ? (
              <>
                <Link href="/profile" className={styles.userName}>
                  {user.displayName || "minha conta"}
                </Link>
                <Button href="/projects">Projetos</Button>
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
