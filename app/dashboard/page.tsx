import Link from "next/link";
import { projects, getResponsesByProjectId, getApprovalRate } from "@/lib/mock-data";
import styles from "./page.module.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DashboardPage() {
  return (
    <section className={`${styles.page} container`}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>
        Resultados das validações recebidas para os seus projetos (dados de exemplo).
      </p>

      <div className={styles.projectsGrid}>
        {projects.map((project) => {
          const projectResponses = getResponsesByProjectId(project.id);
          const approvalRate = getApprovalRate(project.id);

          return (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectHeader}>
                <h2 className={styles.projectName}>{project.name}</h2>
                <Link href={`/p/${project.id}`} className={styles.projectLink}>
                  ver link público
                </Link>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{projectResponses.length}</span>
                  <span className={styles.metricLabel}>respostas</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>
                    {approvalRate === null ? "—" : `${approvalRate}%`}
                  </span>
                  <span className={styles.metricLabel}>aprovação</span>
                </div>
              </div>

              {projectResponses.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Avaliador</th>
                      <th>Aprovado</th>
                      <th>Reprovado</th>
                      <th>N/A</th>
                      <th>Comentário</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectResponses.map((response) => {
                      const aprovado = response.answers.filter((a) => a.status === "aprovado").length;
                      const reprovado = response.answers.filter((a) => a.status === "reprovado").length;
                      const na = response.answers.filter((a) => a.status === "na").length;
                      return (
                        <tr key={response.id}>
                          <td>{response.reviewerName}</td>
                          <td>{aprovado}</td>
                          <td>{reprovado}</td>
                          <td>{na}</td>
                          <td className={styles.commentCell}>{response.comment}</td>
                          <td>{formatDate(response.submittedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className={styles.noResponses}>Nenhuma resposta recebida ainda.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
