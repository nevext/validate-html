"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import Button from "./Button";
import { createProject, type ContentType } from "@/lib/firestore";
import styles from "./CreateProjectForm.module.css";

const contentTypeOptions: { value: ContentType; label: string; hint: string }[] = [
  { value: "link", label: "Link / Site", hint: "Cole a URL do site ou da página a validar" },
  { value: "video", label: "Vídeo", hint: "Cole a URL do vídeo hospedado (ex: YouTube, Drive)" },
  { value: "document", label: "Documento", hint: "Cole a URL do documento (ex: PDF, Figma, Docs)" },
  { value: "file", label: "Arquivo para download (.apk, .exe)", hint: "Cole o link de download do arquivo" },
];

export default function CreateProjectForm() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<ContentType>("link");
  const [contentUrl, setContentUrl] = useState("");
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !contentUrl.trim()) {
      setError("Preencha o nome do projeto e a URL do conteúdo.");
      return;
    }

    setError("");
    setPending(true);
    try {
      const slug = await createProject({
        ownerId: user.uid,
        title: title.trim(),
        contentType,
        contentUrl: contentUrl.trim(),
      });
      setGeneratedSlug(slug);
      setCopied(false);
    } catch {
      setError("Não foi possível criar o projeto. Tente novamente.");
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

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.fieldLabel} htmlFor="project-title">
          Nome do projeto
        </label>
        <input
          id="project-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: App Mobile Beta"
          className={styles.input}
        />

        <fieldset className={styles.fieldset}>
          <legend className={styles.fieldLabel}>Tipo de conteúdo</legend>
          <div className={styles.typeOptions}>
            {contentTypeOptions.map((option) => (
              <label key={option.value} className={styles.typeOption}>
                <input
                  type="radio"
                  name="content-type"
                  value={option.value}
                  checked={contentType === option.value}
                  onChange={() => setContentType(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className={styles.fieldLabel} htmlFor="project-url">
          {contentTypeOptions.find((o) => o.value === contentType)?.hint}
        </label>
        <input
          id="project-url"
          type="text"
          value={contentUrl}
          onChange={(e) => setContentUrl(e.target.value)}
          placeholder="https://..."
          className={styles.input}
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
            Projeto: {title} · Tipo: {contentTypeOptions.find((o) => o.value === contentType)?.label}
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
          <Button href={`/p/${generatedSlug}`}>Ver como ficaria</Button>
        </div>
      )}
    </>
  );
}
