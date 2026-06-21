import RequireAuth from "@/components/RequireAuth";
import CreateProjectForm from "@/components/CreateProjectForm";
import styles from "./page.module.css";

export default function CreateProjectPage() {
  return (
    <RequireAuth>
      <section className={`${styles.page} container`}>
        <h1 className={styles.title}>Criar projeto</h1>
        <p className={styles.subtitle}>
          Anexe o conteúdo que deseja validar. Você vai receber um link único pra compartilhar — quem
          abrir responde um checklist rápido de design, UX e bugs, sem precisar de conta.
        </p>
        <CreateProjectForm />
      </section>
    </RequireAuth>
  );
}
