"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBuildBySlug, getProject, type BuildDoc, type ProjectDoc } from "@/lib/firestore";
import ContentPreview from "@/components/ContentPreview";
import ValidationForm from "@/components/ValidationForm";
import ProjectNotFound from "./not-found";
import styles from "./page.module.css";

export default function ValidationPage() {
  const params = useParams<{ slug: string }>();
  const [build, setBuild] = useState<BuildDoc | null>(null);
  const [project, setProject] = useState<ProjectDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const buildResult = await getBuildBySlug(params.slug);
      if (!buildResult) {
        if (active) setLoading(false);
        return;
      }
      const projectResult = await getProject(buildResult.projectId);
      if (active) {
        setBuild(buildResult);
        setProject(projectResult);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [params.slug]);

  if (loading) {
    return (
      <section className={`${styles.page} container`}>
        <p className={styles.kicker}>Carregando...</p>
      </section>
    );
  }

  if (!build || !project) {
    return <ProjectNotFound />;
  }

  return (
    <section className={`${styles.page} container`}>
      <div className={styles.intro}>
        <p className={styles.kicker}>Você foi convidado a validar</p>
        <h1 className={styles.title}>
          {project.title} <span className={styles.buildLabel}>· {build.label}</span>
        </h1>
      </div>

      {build.ownerNote.trim() && (
        <div className={styles.ownerNote}>
          <p className={styles.ownerNoteLabel}>Observação de quem criou esta build</p>
          <p>{build.ownerNote}</p>
        </div>
      )}

      <ContentPreview contentType={project.contentType} contentUrl={build.contentUrl} name={project.title} />

      <ValidationForm buildId={build.id} contentType={project.contentType} />
    </section>
  );
}
