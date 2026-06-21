"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import Button from "./Button";
import SignOutButton from "./SignOutButton";
import styles from "./Header.module.css";

export default function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.siteHeader}>
      <div className={`${styles.headerCard} container`}>
        <div className={styles.brandSmall}>
          <a
            href="https://github.com/nevext"
            target="_blank"
            rel="noopener"
            className={styles.ownerLogo}
            title="Um produto Nevext"
          >
            <Image src="/img/nevext-logo-icon.png" alt="Nevext" width={28} height={28} />
          </a>
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

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileLinkGroup}>
            <Link href="/#sobre" onClick={() => setMenuOpen(false)}>
              sobre
            </Link>
            <Link href="/privacidade" onClick={() => setMenuOpen(false)}>
              política de privacidade
            </Link>
          </nav>
          <div className={styles.mobileButtonGroup}>
            {!loading &&
              (user ? (
                <>
                  <Link href="/profile" className={styles.userName} onClick={() => setMenuOpen(false)}>
                    {user.displayName || "minha conta"}
                  </Link>
                  <Button href="/projects" fullWidth>
                    Projetos
                  </Button>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Button href="/login" variant="secondary" fullWidth>
                    Entrar
                  </Button>
                  <Button href="/signup" fullWidth>
                    Cadastrar
                  </Button>
                </>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
