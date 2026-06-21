"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import {
  getProjectsByOwner,
  getValidationsByProject,
  type ProjectDoc,
  type ValidationDoc,
} from "@/lib/firestore";
import styles from "./DashboardContent.module.css";

type ProjectWithValidations = {
  project: ProjectDoc;
  validations: ValidationDoc[];
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
}

function formatDate(timestamp: ValidationDoc["createdAt"]) {
  if (!timestamp) return "—";
  return timestamp.toDate().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState<ProjectWithValidations[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      const projects = await getProjectsByOwner(user!.uid);
      const withValidations = await Promise.all(
        projects.map(async (project) => ({
          project,
          validations: await getValidationsByProject(project.id),
        }))
      );
      if (active) setData(withValidations);
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  if (!data) {
    return <p className={styles.status}>Carregando...</p>;
  }

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Você ainda não criou nenhum projeto.</p>
        <Link href="/create" className={styles.emptyLink}>
          Criar o primeiro projeto
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.projectsGrid}>
      {data.map(({ project, validations }) => {
        const designAvg = average(validations.map((v) => v.designRating));
        const uxAvg = average(validations.map((v) => v.uxRating));

        return (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <h2 className={styles.projectName}>{project.title}</h2>
              <Link href={`/p/${project.slug}`} className={styles.projectLink}>
                ver link público
              </Link>
            </div>

            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{validations.length}</span>
                <span className={styles.metricLabel}>validações</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{designAvg ?? "—"}</span>
                <span className={styles.metricLabel}>nota design</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{uxAvg ?? "—"}</span>
                <span className={styles.metricLabel}>nota ux</span>
              </div>
            </div>

            {validations.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Design</th>
                    <th>UX</th>
                    <th>Bugs</th>
                    <th>Comentário</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {validations.map((validation) => (
                    <tr key={validation.id}>
                      <td>{validation.designRating}★</td>
                      <td>{validation.uxRating}★</td>
                      <td className={styles.commentCell}>{validation.bugs || "—"}</td>
                      <td className={styles.commentCell}>{validation.comment || "—"}</td>
                      <td>{formatDate(validation.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.noResponses}>Nenhuma validação recebida ainda.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
