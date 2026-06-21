"use client";

import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import Button from "./Button";

const PROTECTED_PATHS = ["/create", "/dashboard"];

export default function SignOutButton() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut(auth);
    // Em páginas protegidas, o RequireAuth já redireciona pra /login quando a
    // sessão cai; navegar pra "/" aqui ao mesmo tempo criava uma corrida entre
    // os dois redirecionamentos. Em páginas públicas, só atualiza o header.
    if (!PROTECTED_PATHS.includes(pathname)) return;
    router.push("/");
  }

  return (
    <Button type="button" variant="secondary" onClick={handleSignOut}>
      Sair
    </Button>
  );
}
