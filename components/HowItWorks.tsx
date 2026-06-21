import styles from "./HowItWorks.module.css";

const steps = [
  {
    title: "1. Crie um projeto e sua primeira build",
    description: "Defina o tipo de conteúdo e gere o link",
  },
  {
    title: "2. Compartilhe e receba feedback",
    description: "Checklist adaptado ao tipo de conteúdo, sem login pra validar",
  },
  {
    title: "3. Evolua build após build",
    description: "Veja o histórico, crie a próxima a partir da anterior, acompanhe a evolução",
  },
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
