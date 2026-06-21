import { Suspense } from "react";
import RequireAuth from "@/components/RequireAuth";
import CreateBuildForm from "@/components/CreateBuildForm";
import styles from "./page.module.css";

export default function NewBuildPage() {
  return (
    <RequireAuth>
      <section className={`${styles.page} container`}>
        <h1 className={styles.title}>Nova build</h1>
        <p className={styles.subtitle}>
          Gere um novo link pra essa versão do projeto. Se ela vem de uma build anterior, você vê
          os bugs e comentários recebidos antes de escrever sua observação pra quem for testar.
        </p>
        <Suspense fallback={<p>Carregando...</p>}>
          <CreateBuildForm />
        </Suspense>
      </section>
    </RequireAuth>
  );
}
