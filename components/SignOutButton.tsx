"use client";

import { signOut } from "next-auth/react";
import Button from "./Button";

export default function SignOutButton() {
  return (
    <Button type="button" variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
      Sair
    </Button>
  );
}
