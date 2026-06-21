import Button from "./Button";
import styles from "./Hero.module.css";

const demoChecklist = [
  { label: "Design", stars: "★★★★☆" },
  { label: "UX", stars: "★★★☆☆" },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.grid} container`}>
        <div className={styles.copy}>
          <h1 className={styles.title}>
            <span className={styles.titleLine}>
              Pare de perguntar <q>vê aí se tá bom</q>
            </span>
            <span className={styles.titleAccent}>Valida aí.</span>
          </h1>
          <p className={styles.description}>
            Deixe que respondam num checklist real — design, UX e bugs — direto no link que você
            gerou.
          </p>
          <Button href="/create">Gerar meu link →</Button>
        </div>

        <div className={styles.demoCard}>
          <div className={styles.demoLink}>validate.com/p/9kX2a</div>
          {demoChecklist.map((item) => (
            <div key={item.label} className={styles.demoRow}>
              <span>{item.label}</span>
              <span>{item.stars}</span>
            </div>
          ))}
          <div className={styles.demoRow}>
            <span>Bugs</span>
            <span className={styles.demoBugs}>2 encontrados</span>
          </div>
          <div className={styles.demoComment}>&quot;Botão de enviar fica fora da tela no mobile&quot;</div>
        </div>
      </div>
    </section>
  );
}
