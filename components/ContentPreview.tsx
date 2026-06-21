import Button from "./Button";
import type { ContentType } from "@/lib/mock-data";
import styles from "./ContentPreview.module.css";

const typeLabels: Record<ContentType, string> = {
  site: "Site",
  video: "Vídeo",
  document: "Documento",
  executable: "Arquivo para download",
};

export default function ContentPreview({
  contentType,
  contentUrl,
  name,
}: {
  contentType: ContentType;
  contentUrl: string;
  name: string;
}) {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewLabel}>{typeLabels[contentType]}</div>

      {contentType === "site" && contentUrl && (
        <>
          <div className={styles.embedBox}>
            <iframe
              src={contentUrl}
              title={name}
              sandbox="allow-scripts allow-same-origin"
              className={styles.iframe}
            />
          </div>
          <a href={contentUrl} target="_blank" rel="noopener" className={styles.fallbackLink}>
            Abrir site em nova guia
          </a>
        </>
      )}

      {contentType === "video" && contentUrl && (
        <div className={styles.embedBox}>
          <video controls src={contentUrl} className={styles.video} />
        </div>
      )}

      {contentType === "document" && contentUrl && (
        <div className={styles.embedBox}>
          <iframe src={contentUrl} title={name} className={styles.iframe} />
        </div>
      )}

      {(contentType === "video" || contentType === "document") && !contentUrl && (
        <div className={styles.placeholder}>
          <p>Pré-visualização não disponível neste protótipo.</p>
          <p className={styles.placeholderHint}>
            Quando o backend existir, o {typeLabels[contentType].toLowerCase()} enviado aparecerá
            embutido aqui.
          </p>
        </div>
      )}

      {contentType === "executable" && (
        <div className={styles.downloadBox}>
          <p>Este conteúdo é um arquivo executável e precisa ser baixado para ser avaliado.</p>
          <Button href={contentUrl} target="_blank" rel="noopener">
            Baixar arquivo
          </Button>
        </div>
      )}
    </div>
  );
}
