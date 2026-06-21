"use client";

import { useState } from "react";
import Button from "./Button";
import type { ContentType } from "@/lib/mock-data";
import styles from "./CreateProjectForm.module.css";

const contentTypeOptions: { value: ContentType; label: string; hint: string }[] = [
  { value: "site", label: "Link / Site", hint: "Cole a URL do site ou da página a validar" },
  { value: "video", label: "Vídeo", hint: "Cole a URL do vídeo hospedado (ex: YouTube, Drive)" },
  { value: "document", label: "Documento", hint: "Cole a URL do documento (ex: PDF, Figma, Docs)" },
  { value: "executable", label: "Arquivo para download (.apk, .exe)", hint: "Anexe o arquivo executável" },
];

const checklistCategoryOptions = [
  { value: "design", label: "Design" },
  { value: "ux", label: "UX" },
  { value: "bugs", label: "Bugs" },
] as const;

const DEMO_PROJECT_ID = "abc123";

export default function CreateProjectForm() {
  const [name, setName] = useState("");
  const [contentType, setContentType] = useState<ContentType>("site");
  const [contentUrl, setContentUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["design", "ux", "bugs"])
  );
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [customItemDraft, setCustomItemDraft] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  function toggleCategory(value: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function addCustomItem() {
    if (!customItemDraft.trim()) return;
    setCustomItems((prev) => [...prev, customItemDraft.trim()]);
    setCustomItemDraft("");
  }

  function removeCustomItem(index: number) {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const link = `validate.com/p/${DEMO_PROJECT_ID}`;
    setGeneratedLink(link);
    setCopied(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`https://${generatedLink}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.fieldLabel} htmlFor="project-name">
          Nome do projeto
        </label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

        {contentType === "executable" ? (
          <>
            <label className={styles.fieldLabel} htmlFor="project-file">
              Arquivo
            </label>
            <input
              id="project-file"
              type="file"
              className={styles.input}
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
            {fileName && <p className={styles.fileHint}>Selecionado: {fileName}</p>}
          </>
        ) : (
          <>
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
          </>
        )}

        <fieldset className={styles.fieldset}>
          <legend className={styles.fieldLabel}>Checklist de validação</legend>
          <div className={styles.checklistOptions}>
            {checklistCategoryOptions.map((option) => (
              <label key={option.value} className={styles.checklistOption}>
                <input
                  type="checkbox"
                  checked={selectedCategories.has(option.value)}
                  onChange={() => toggleCategory(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <div className={styles.customItems}>
            {customItems.map((item, index) => (
              <div key={index} className={styles.customItem}>
                <span>{item}</span>
                <button type="button" onClick={() => removeCustomItem(index)} className={styles.removeBtn}>
                  remover
                </button>
              </div>
            ))}
            <div className={styles.customItemAdd}>
              <input
                type="text"
                value={customItemDraft}
                onChange={(e) => setCustomItemDraft(e.target.value)}
                placeholder="Adicionar item customizado de checklist"
                className={styles.input}
              />
              <Button type="button" variant="secondary" onClick={addCustomItem}>
                Adicionar
              </Button>
            </div>
          </div>
        </fieldset>

        <Button type="submit">Gerar link</Button>
      </form>

      {generatedLink && (
        <div className={styles.resultCard}>
          <h3>Link gerado</h3>
          <p className={styles.resultSummary}>
            Projeto: {name || "(sem nome)"} · Tipo: {contentTypeOptions.find((o) => o.value === contentType)?.label}
          </p>
          <div className={styles.linkRow}>
            <input type="text" readOnly value={`https://${generatedLink}`} className={styles.linkInput} />
            <Button type="button" variant="secondary" onClick={handleCopy}>
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
          </div>
          <p className={styles.resultHint}>
            Neste protótipo, todo link gerado leva à mesma página de exemplo (
            <code>/p/{DEMO_PROJECT_ID}</code>) para você ver como ficaria o fluxo de validação.
          </p>
          <Button href={`/p/${DEMO_PROJECT_ID}`}>Ver como ficaria</Button>
        </div>
      )}
    </>
  );
}
