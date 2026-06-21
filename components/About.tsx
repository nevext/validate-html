import RevealOnScroll from "./RevealOnScroll";
import styles from "./About.module.css";

export default function About() {
  return (
    <section id="sobre" className={styles.section}>
      <div className="container">
        <RevealOnScroll className={styles.content}>
          <h2 className={styles.title}>Sobre o Validate</h2>
          <p className={styles.paragraph}>
            O Validate nasceu de um problema simples: pedir feedback sobre um site, app ou vídeo
            quase sempre vira uma conversa vaga — <q>tá bom?</q>, <q>dá uma olhada aí</q>. A
            resposta raramente diz o que realmente precisa mudar.
          </p>
          <p className={styles.paragraph}>
            Com o Validate, você gera um link e compartilha com quem for testar — sem exigir login
            de quem responde — e recebe de volta um checklist real de design, UX e bugs, com
            comentários específicos. Tudo organizado num painel só seu, pra decidir o que ajustar
            antes de lançar.
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
