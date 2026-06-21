import Button from "./Button";
import type { ContentType } from "@/lib/firestore";
import styles from "./ContentPreview.module.css";

const typeLabels: Record<ContentType, string> = {
  link: "Site",
  video: "Vídeo",
  document: "Documento",
  file: "Arquivo para download",
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

      {contentType === "link" && contentUrl && (
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

      {contentType === "file" && (
        <div className={styles.downloadBox}>
          <p>Este conteúdo é um arquivo e precisa ser baixado para ser avaliado.</p>
          <Button href={contentUrl} target="_blank" rel="noopener">
            Baixar arquivo
          </Button>
        </div>
      )}
    </div>
  );
}
