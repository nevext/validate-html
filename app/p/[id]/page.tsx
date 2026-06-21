import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/mock-data";
import ContentPreview from "@/components/ContentPreview";
import ChecklistForm from "@/components/ChecklistForm";
import styles from "./page.module.css";

export default async function ValidationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <section className={`${styles.page} container`}>
      <div className={styles.intro}>
        <p className={styles.kicker}>Você foi convidado a validar</p>
        <h1 className={styles.title}>{project.name}</h1>
        <p className={styles.description}>{project.description}</p>
      </div>

      <ContentPreview
        contentType={project.contentType}
        contentUrl={project.contentUrl}
        name={project.name}
      />

      <ChecklistForm checklist={project.checklist} />
    </section>
  );
}
