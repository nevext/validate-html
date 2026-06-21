import RequireAuth from "@/components/RequireAuth";
import CreateProjectForm from "@/components/CreateProjectForm";
import styles from "./page.module.css";

export default function CreateProjectPage() {
  return (
    <RequireAuth>
      <section className={`${styles.page} container`}>
        <h1 className={styles.title}>Criar projeto</h1>
        <p className={styles.subtitle}>
          Anexe o conteúdo que deseja validar e monte o checklist que outras pessoas vão responder.
          Esta é uma versão de protótipo — nenhum dado é salvo de verdade ainda.
        </p>
        <CreateProjectForm />
      </section>
    </RequireAuth>
  );
}
