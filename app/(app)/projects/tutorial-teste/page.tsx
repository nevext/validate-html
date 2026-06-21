import styles from "./page.module.css";

// Texto inicial (rascunho) — revisar antes de considerar definitivo.
const steps = [
  {
    title: "1. Quem recebe o link não precisa de conta",
    description: "É só abrir o link compartilhado — sem login, sem cadastro.",
  },
  {
    title: "2. A pessoa vê o conteúdo da build",
    description: "Site embutido, vídeo, documento, ou um botão de download (pra apk/exe).",
  },
  {
    title: "3. O checklist muda de acordo com o tipo de conteúdo",
    description:
      "Perguntas simples, por estrela (1 a 5) ou sim/não — sobre aparência, funcionamento, clareza, etc.",
  },
  {
    title: "4. Campos de bugs e comentário livre",
    description: "Pra detalhar qualquer problema encontrado ou observação geral.",
  },
  {
    title: "5. Você vê tudo no dashboard",
    description: "Cada resposta aparece na build correspondente, com nota média e histórico.",
  },
];

export default function TestingTutorialPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Tutorial de teste</h1>
      <div className={styles.steps}>
        {steps.map((step) => (
          <div key={step.title} className={styles.step}>
            <div className={styles.stepTitle}>{step.title}</div>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
