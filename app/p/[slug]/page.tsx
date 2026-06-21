"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProjectBySlug, type ProjectDoc } from "@/lib/firestore";
import ContentPreview from "@/components/ContentPreview";
import ValidationForm from "@/components/ValidationForm";
import ProjectNotFound from "./not-found";
import styles from "./page.module.css";

export default function ValidationPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProjectBySlug(params.slug).then((result) => {
      if (active) {
        setProject(result);
        setLoading(false);
      }
    });
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

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <section className={`${styles.page} container`}>
      <div className={styles.intro}>
        <p className={styles.kicker}>Você foi convidado a validar</p>
        <h1 className={styles.title}>{project.title}</h1>
      </div>

      <ContentPreview
        contentType={project.contentType}
        contentUrl={project.contentUrl}
        name={project.title}
      />

      <ValidationForm projectId={project.id} />
    </section>
  );
}
