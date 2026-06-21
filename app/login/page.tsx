"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import { login } from "@/lib/auth-actions";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const result = await login(email, password);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/create");
  }

  return (
    <section className={`${styles.page} container`}>
      <div className={styles.card}>
        <h1 className={styles.title}>Entrar</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.fieldLabel} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="email@exemplo.com"
          />

          <label className={styles.fieldLabel} htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className={styles.footerText}>
          Ainda não tem conta? <Link href="/signup">Cadastre-se</Link>
        </p>
      </div>
    </section>
  );
}
