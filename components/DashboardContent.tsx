"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import StatusBadge, { statusLabels } from "./StatusBadge";
import {
  getBuildsByProject,
  getProjectsByOwner,
  getValidationsByBuild,
  updateBuildStatus,
  type BuildDoc,
  type BuildStatus,
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
  return timestamp.toDate().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState<ProjectWithBuilds[] | null>(null);

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

  return (
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
                      <span>{validations.length} validações</span>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
