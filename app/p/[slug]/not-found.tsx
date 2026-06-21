import Button from "@/components/Button";
import styles from "./not-found.module.css";

export default function ProjectNotFound() {
  return (
    <section className={`${styles.page} container`}>
      <div className={styles.card}>
        <h2>Projeto não encontrado</h2>
        <p>Este link de validação não existe ou não está mais disponível.</p>
        <Button href="/">Voltar para a home</Button>
      </div>
    </section>
  );
}
