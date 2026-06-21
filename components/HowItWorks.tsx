import styles from "./HowItWorks.module.css";

const steps = [
  { title: "1. Suba o link", description: "Site, vídeo, doc ou app" },
  { title: "2. Compartilhe", description: "Um link, sem login pra validar" },
  { title: "3. Veja o resultado", description: "Checklist e comentários no painel" },
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>Como funciona</h2>
        <div className={styles.grid}>
          {steps.map((step) => (
            <div key={step.title} className={styles.step}>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepDescription}>{step.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
