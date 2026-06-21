"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { login } from "@/lib/actions/auth";
import styles from "./page.module.css";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <section className={`${styles.page} container`}>
      <div className={styles.card}>
        <h1 className={styles.title}>Entrar</h1>
        <form className={styles.form} action={formAction}>
          <label className={styles.fieldLabel} htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className={styles.input} placeholder="email@exemplo.com" />

          <label className={styles.fieldLabel} htmlFor="password">
            Senha
          </label>
          <input id="password" name="password" type="password" required className={styles.input} placeholder="••••••••" />

          {state?.error && <p className={styles.error}>{state.error}</p>}

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
