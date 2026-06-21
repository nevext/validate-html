import Link from "next/link";
import { auth } from "@/auth";
import Button from "./Button";
import SignOutButton from "./SignOutButton";
import styles from "./Header.module.css";

export default async function Header() {
  const session = await auth();

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
          {session?.user && <span className={styles.userName}>{session.user.name}</span>}
        </nav>
        <div className={styles.buttonGroup}>
          {session?.user ? (
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
          )}
        </div>
      </div>
    </header>
  );
}
