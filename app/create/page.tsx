import RequireAuth from "@/components/RequireAuth";
import CreateProjectForm from "@/components/CreateProjectForm";
import styles from "./page.module.css";

export default function CreateProjectPage() {
  return (
    <RequireAuth>
      <section className={`${styles.page} container`}>
        <h1 className={styles.title}>Criar projeto</h1>
        <p className={styles.subtitle}>
          Isso cria o projeto e a primeira build. Você vai receber um link único pra compartilhar —
          quem abrir responde um checklist sem precisar de conta. Builds seguintes podem ser criadas
          depois, direto do dashboard.
        </p>
        <CreateProjectForm />
      </section>
    </RequireAuth>
  );
}
