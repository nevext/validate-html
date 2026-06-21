import styles from "./page.module.css";

// Texto inicial (rascunho) — revisar antes de considerar definitivo.
const steps = [
  {
    title: "1. Clique em \"Submeter novo projeto\"",
    description: "No hub de Projetos, escolha essa opção pra começar.",
  },
  {
    title: "2. Escolha o tipo de conteúdo",
    description: "Link/site, vídeo, documento ou arquivo para download (.apk, .exe).",
  },
  {
    title: "3. Cole a URL do conteúdo e dê um nome pra build",
    description: "Ex: \"Build 1\". É essa versão que vai ser validada primeiro.",
  },
  {
    title: "4. Clique em \"Gerar link\" e copie o link gerado",
    description: "Esse é o link que você vai compartilhar com quem for testar.",
  },
  {
    title: "5. Acompanhe as respostas no dashboard",
    description: "Validações, bugs e comentários aparecem em \"Projetos em andamento\".",
  },
  {
    title: "6. Quando corrigir algo, crie uma nova build",
    description:
      "No dashboard, clique em \"+ nova build\" no projeto. Você vai ver os bugs e comentários da build anterior e poderá escrever uma observação pra quem for testar a nova versão.",
  },
];

export default function SubmissionTutorialPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Tutorial de submissão</h1>
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
