import RevealOnScroll from "./RevealOnScroll";
import styles from "./MediaShowcase.module.css";

export type ShowcaseMedia = {
  type: "image" | "video";
  src: string;
  alt: string;
};

// Sem `media`, mostra um placeholder. Para usar um screenshot real:
// <MediaShowcase media={{ type: "image", src: "/img/product-screenshot.png", alt: "..." }} />
// Quando houver um vídeo de demonstração, basta trocar type para "video".
export default function MediaShowcase({ media }: { media?: ShowcaseMedia }) {
  return (
    <section className={styles.section}>
      <div className="container">
        <RevealOnScroll className={styles.frame}>
          {media?.type === "video" ? (
            <video src={media.src} controls className={styles.media} />
          ) : media?.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.src} alt={media.alt} className={styles.media} />
          ) : (
            <div className={styles.placeholder}>
              <span>Screenshot do produto em breve</span>
            </div>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}
