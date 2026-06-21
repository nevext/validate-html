import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

// O SDK do Storage tenta de novo (com backoff) em falhas de rede/CORS antes de
// desistir, o que trava a UI por bastante tempo se o bucket não existir ainda
// (Storage não habilitado no console). Esse timeout evita ficar preso nisso.
const UPLOAD_TIMEOUT_MS = 12000;

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const photoRef = ref(storage, `profile-photos/${uid}`);

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("Tempo esgotado ao enviar a foto. Verifique se o Firebase Storage está habilitado.")),
      UPLOAD_TIMEOUT_MS
    )
  );

  await Promise.race([uploadBytes(photoRef, file), timeout]);
  return getDownloadURL(photoRef);
}
