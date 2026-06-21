"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export type AuthActionState = { error?: string } | null;

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }

  try {
    revalidatePath("/", "layout");
    await signIn("credentials", { email, password, redirectTo: "/create" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Email ou senha inválidos." };
    }
    throw err;
  }

  return null;
}

export async function signUp(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com esse email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });

  try {
    revalidatePath("/", "layout");
    await signIn("credentials", { email, password, redirectTo: "/create" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Conta criada, mas não foi possível entrar automaticamente. Tente fazer login." };
    }
    throw err;
  }

  return null;
}
