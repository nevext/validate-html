"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import StatusBadge, { statusLabels } from "./StatusBadge";
import { checklists } from "@/lib/checklists";
import {
  getBuildsByProject,
  getProjectsByOwner,
  getValidationsByBuild,
  updateBuildStatus,
  type BuildDoc,
  type BuildStatus,
  type ContentType,
  type ProjectDoc,
  type ValidationDoc,
} from "@/lib/firestore";
import styles from "./DashboardContent.module.css";

type BuildWithValidations = { build: BuildDoc; validations: ValidationDoc[] };
type ProjectWithBuilds = { project: ProjectDoc; builds: BuildWithValidations[] };

const ALL_STATUSES: BuildStatus[] = ["gray", "green", "yellow", "red", "blue"];

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
}

function ratingAverage(validations: ValidationDoc[]): number | null {
  const allValues = validations.flatMap((v) => Object.values(v.ratings));
  return average(allValues);
}

function formatDate(timestamp: BuildDoc["createdAt"]) {
  if (!timestamp) return "—";
  return timestamp.toDate().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ValidationHistory({
  validations,
  contentType,
}: {
  validations: ValidationDoc[];
  contentType: ContentType;
}) {
  const questions = checklists[contentType];

  if (validations.length === 0) {
    return <p className={styles.noResponses}>Nenhuma validação recebida ainda.</p>;
  }

  return (
    <div className={styles.historyList}>
      {validations.map((validation) => (
        <div key={validation.id} className={styles.historyItem}>
          <p className={styles.historyDate}>{formatDate(validation.createdAt)}</p>
          <div className={styles.historyAnswers}>
            {questions.map((question) => {
              const value = validation.ratings[question.key];
              const answer =
                question.type === "boolean" ? (value === 1 ? "Sim" : "Não") : `${value ?? "—"}/5`;
              return (
                <span key={question.key} className={styles.historyAnswer}>
                  {question.label}: <strong>{answer}</strong>
                </span>
              );
            })}
          </div>
          {validation.bugs.trim() && (
            <p className={styles.historyBugs}>
              <strong>Bugs:</strong> {validation.bugs}
            </p>
          )}
          {validation.comment.trim() && (
            <p className={styles.historyComment}>
              <strong>Comentário:</strong> {validation.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState<ProjectWithBuilds[] | null>(null);
  const [expandedBuildId, setExpandedBuildId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      const projects = await getProjectsByOwner(user!.uid);
      const withBuilds = await Promise.all(
        projects.map(async (project) => {
          const builds = await getBuildsByProject(project.id);
          const buildsWithValidations = await Promise.all(
            builds.map(async (build) => ({
              build,
              validations: await getValidationsByBuild(build.id),
            }))
          );
          return { project, builds: buildsWithValidations };
        })
      );
      if (active) setData(withBuilds);
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleStatusChange(buildId: string, status: BuildStatus) {
    setData(
      (prev) =>
        prev?.map((p) => ({
          ...p,
          builds: p.builds.map((b) => (b.build.id === buildId ? { ...b, build: { ...b.build, status } } : b)),
        })) ?? null
    );
    await updateBuildStatus(buildId, status);
  }

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

  const allBuilds = data.flatMap((p) => p.builds);
  const totalValidations = allBuilds.reduce((sum, b) => sum + b.validations.length, 0);
  const resolvedBuilds = allBuilds.filter((b) => b.build.status === "green").length;
  const pendingBuilds = allBuilds.length - resolvedBuilds;

  return (
    <div className={styles.dashboardLayout}>
    <div className={styles.projectsGrid}>
      {data.map(({ project, builds }) => (
        <div key={project.id} className={styles.projectCard}>
          <div className={styles.projectHeader}>
            <h2 className={styles.projectName}>{project.title}</h2>
            <Link href={`/builds/new?projectId=${project.id}`} className={styles.newBuildLink}>
              + nova build
            </Link>
          </div>

          {builds.length === 0 ? (
            <p className={styles.noResponses}>Nenhuma build criada ainda.</p>
          ) : (
            <div className={styles.buildsList}>
              {builds.map(({ build, validations }) => {
                const avg = ratingAverage(validations);
                const expanded = expandedBuildId === build.id;
                return (
                  <div key={build.id} className={styles.buildRow}>
                    <div className={styles.buildHeader}>
                      <div className={styles.buildHeaderLeft}>
                        <span className={styles.buildLabel}>{build.label}</span>
                        <StatusBadge status={build.status} />
                      </div>
                      <Link href={`/p/${build.slug}`} className={styles.projectLink}>
                        ver link público
                      </Link>
                    </div>

                    <div className={styles.buildMeta}>
                      <button
                        type="button"
                        className={styles.historyToggle}
                        onClick={() => setExpandedBuildId(expanded ? null : build.id)}
                      >
                        {validations.length} validações{expanded ? " ▲" : " ▼"}
                      </button>
                      <span>nota média: {avg ?? "—"}</span>
                      <span>{formatDate(build.createdAt)}</span>
                      <select
                        value={build.status}
                        onChange={(e) => handleStatusChange(build.id, e.target.value as BuildStatus)}
                        className={styles.statusSelect}
                      >
                        {ALL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {expanded && (
                      <ValidationHistory validations={validations} contentType={project.contentType} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>

      <aside className={styles.summaryPanel}>
        <h2 className={styles.summaryTitle}>Resumo</h2>
        <div className={styles.summaryStat}>
          <span className={styles.summaryValue}>{totalValidations}</span>
          <span className={styles.summaryLabel}>validações recebidas</span>
        </div>
        <div className={styles.summaryStat}>
          <span className={styles.summaryValue}>{pendingBuilds}</span>
          <span className={styles.summaryLabel}>builds pendentes</span>
        </div>
        <div className={styles.summaryStat}>
          <span className={styles.summaryValue}>{resolvedBuilds}</span>
          <span className={styles.summaryLabel}>builds aprovadas</span>
        </div>
      </aside>
    </div>
  );
}
