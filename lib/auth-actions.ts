import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

function mapAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Já existe uma conta com esse email.";
      case "auth/weak-password":
        return "A senha precisa ter pelo menos 6 caracteres.";
      case "auth/invalid-email":
        return "Email inválido.";
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Email ou senha inválidos.";
      default:
        return "Não foi possível concluir. Tente novamente.";
    }
  }
  return "Não foi possível concluir. Tente novamente.";
}

export async function login(email: string, password: string): Promise<{ error?: string }> {
  try {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return {};
  } catch (error) {
    return { error: mapAuthError(error) };
  }
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ error?: string }> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    await updateProfile(credential.user, { displayName: name.trim() });
    return {};
  } catch (error) {
    return { error: mapAuthError(error) };
  }
}

export async function loginWithGoogle(): Promise<{ error?: string; cancelled?: boolean }> {
  try {
    await signInWithPopup(auth, googleProvider);
    return {};
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/popup-closed-by-user") {
      return { cancelled: true };
    }
    return { error: mapAuthError(error) };
  }
}
