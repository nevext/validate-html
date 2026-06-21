"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import SignOutButton from "./SignOutButton";
import styles from "./Sidebar.module.css";

const links = [
  { href: "/projects", label: "Visão geral" },
  { href: "/create", label: "Submeter projeto" },
  { href: "/dashboard", label: "Projetos em andamento" },
  { href: "/projects/tutorial-submissao", label: "Tutorial de submissão" },
  { href: "/projects/tutorial-teste", label: "Tutorial de teste" },
  { href: "/profile", label: "Meu perfil" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand}>
        VALIDATE
      </Link>
      {user && <p className={styles.userName}>{user.displayName || user.email}</p>}
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className={styles.footer}>
        <SignOutButton />
      </div>
    </aside>
  );
}
