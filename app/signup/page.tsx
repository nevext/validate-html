"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { signUp } from "@/lib/actions/auth";
import styles from "./page.module.css";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <section className={`${styles.page} container`}>
      <div className={styles.card}>
        <h1 className={styles.title}>Criar conta</h1>
        <form className={styles.form} action={formAction}>
          <label className={styles.fieldLabel} htmlFor="name">
            Nome
          </label>
          <input id="name" name="name" type="text" required className={styles.input} placeholder="Seu nome" />

          <label className={styles.fieldLabel} htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className={styles.input} placeholder="email@exemplo.com" />

          <label className={styles.fieldLabel} htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className={styles.input}
            placeholder="mínimo 6 caracteres"
          />

          {state?.error && <p className={styles.error}>{state.error}</p>}

          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
        <p className={styles.footerText}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </section>
  );
}
