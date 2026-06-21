import RequireAuth from "@/components/RequireAuth";
import DashboardContent from "@/components/DashboardContent";
import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <section className={`${styles.page} container`}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Resultados das validações recebidas para os seus projetos.</p>
        <DashboardContent />
      </section>
    </RequireAuth>
  );
}
