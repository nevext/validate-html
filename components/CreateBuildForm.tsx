"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Button from "./Button";
import PreviousBuildSummary from "./PreviousBuildSummary";
import { createBuild, getBuildsByProject, getProject, type BuildDoc, type ProjectDoc } from "@/lib/firestore";
import styles from "./CreateBuildForm.module.css";

const NONE_OPTION = "none";

export default function CreateBuildForm() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";

  const [project, setProject] = useState<ProjectDoc | null>(null);
  const [builds, setBuilds] = useState<BuildDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [label, setLabel] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [previousBuildId, setPreviousBuildId] = useState(NONE_OPTION);
  const [ownerNote, setOwnerNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user || !projectId) return;
    let active = true;

    async function load() {
      const projectResult = await getProject(projectId);
      if (!active) return;
      if (!projectResult || projectResult.ownerId !== user!.uid) {
        setLoadError(true);
        setLoading(false);
        return;
      }
      const buildsResult = await getBuildsByProject(projectId);
      if (!active) return;
      setProject(projectResult);
      setBuilds(buildsResult);
      setLabel(`Build ${buildsResult.length + 1}`);
      setPreviousBuildId(buildsResult[0]?.id ?? NONE_OPTION);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [user, projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !project) return;
    if (!label.trim() || !contentUrl.trim()) {
      setError("Preencha o nome da build e a URL do conteúdo.");
      return;
    }

    setError("");
    setPending(true);
    try {
      const build = await createBuild({
        projectId: project.id,
        ownerId: user.uid,
        label: label.trim(),
        contentUrl: contentUrl.trim(),
        ownerNote: ownerNote.trim(),
        previousBuildId: previousBuildId === NONE_OPTION ? null : previousBuildId,
      });
      setGeneratedSlug(build.slug);
      setCopied(false);
    } catch {
      setError("Não foi possível criar a build. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`https://validate.com/p/${generatedSlug}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!projectId || loadError) {
    return (
      <div className={styles.errorCard}>
        <p>Projeto não encontrado.</p>
        <Button href="/dashboard">Voltar para o dashboard</Button>
      </div>
    );
  }

  if (loading || !project) {
    return <p className={styles.status}>Carregando...</p>;
  }

  return (
    <>
      <p className={styles.projectContext}>Nova build para: {project.title}</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.fieldLabel} htmlFor="build-label">
          Nome da build
        </label>
        <input
          id="build-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className={styles.input}
        />

        <label className={styles.fieldLabel} htmlFor="build-url">
          URL do conteúdo desta build
        </label>
        <input
          id="build-url"
          type="text"
          value={contentUrl}
          onChange={(e) => setContentUrl(e.target.value)}
          placeholder="https://..."
          className={styles.input}
        />

        {builds.length > 0 && (
          <>
            <label className={styles.fieldLabel} htmlFor="previous-build">
              Build anterior
            </label>
            <select
              id="previous-build"
              value={previousBuildId}
              onChange={(e) => setPreviousBuildId(e.target.value)}
              className={styles.input}
            >
              <option value={NONE_OPTION}>Nenhuma (build independente)</option>
              {builds.map((build) => (
                <option key={build.id} value={build.id}>
                  {build.label}
                </option>
              ))}
            </select>

            {previousBuildId !== NONE_OPTION && (
              <div className={styles.previousSummary}>
                <p className={styles.fieldLabel}>Bugs e comentários da build anterior</p>
                <PreviousBuildSummary buildId={previousBuildId} />
              </div>
            )}
          </>
        )}

        <label className={styles.fieldLabel} htmlFor="owner-note">
          Observação para quem for testar esta build
        </label>
        <textarea
          id="owner-note"
          rows={3}
          value={ownerNote}
          onChange={(e) => setOwnerNote(e.target.value)}
          placeholder="Ex: corrigi o botão de enviar, ainda não revisei o carregamento lento"
          className={styles.textarea}
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" disabled={pending}>
          {pending ? "Gerando..." : "Gerar link"}
        </Button>
      </form>

      {generatedSlug && (
        <div className={styles.resultCard}>
          <h3>Link gerado</h3>
          <p className={styles.resultSummary}>
            Projeto: {project.title} · {label}
          </p>
          <div className={styles.linkRow}>
            <input
              type="text"
              readOnly
              value={`https://validate.com/p/${generatedSlug}`}
              className={styles.linkInput}
            />
            <Button type="button" variant="secondary" onClick={handleCopy}>
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
          </div>
          <div className={styles.resultActions}>
            <Button href={`/p/${generatedSlug}`}>Ver como ficaria</Button>
            <Button href="/dashboard" variant="secondary">
              Ir para o dashboard
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
