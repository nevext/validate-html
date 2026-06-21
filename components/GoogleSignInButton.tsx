"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { loginWithGoogle } from "@/lib/auth-actions";
import styles from "./GoogleSignInButton.module.css";

export default function GoogleSignInButton({ onError }: { onError: (message: string) => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await loginWithGoogle();
    setPending(false);
    if (result.error) {
      onError(result.error);
      return;
    }
    if (result.cancelled) return;
    router.push("/create");
  }

  return (
    <Button type="button" variant="secondary" fullWidth disabled={pending} onClick={handleClick} className={styles.button}>
      {pending ? "Conectando..." : "Entrar com Google"}
    </Button>
  );
}
