"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { signUp } from "@/lib/auth-actions";
import styles from "./page.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const result = await signUp(name, email, password);
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
        <h1 className={styles.title}>Criar conta</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.fieldLabel} htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Seu nome"
          />

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="mínimo 6 caracteres"
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <div className={styles.divider}>ou</div>
        <GoogleSignInButton onError={setError} />

        <p className={styles.footerText}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </section>
  );
}
