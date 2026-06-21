import Image from "next/image";
import Button from "./Button";
import RevealOnScroll from "./RevealOnScroll";
import styles from "./LeadCardsSection.module.css";

const cards = [
  {
    image: "/img/Glossary.png",
    alt: "Glossário do CIESA",
    title: "GLOSSÁRIO PARA O CIESA",
    paragraph:
      "Parágrafo explicativo do glossário — insira aqui o conteúdo ou descrição que deve aparecer abaixo do título.",
    projectId: "glossario-ciesa",
  },
  {
    image: "/img/Bemvindo.png",
    alt: "Bem-vindo ao Validate",
    title: "BEM VINDO AO CIESA",
    paragraph: "Um site para os novos estudantes do CIESA",
    projectId: "bemvindo-ciesa",
  },
];

export default function LeadCardsSection() {
  return (
    <section className={`${styles.lead} container`}>
      {cards.map((card) => (
        <RevealOnScroll key={card.projectId} className={styles.leadCard}>
          <div className={styles.leadGrid}>
            <div className={styles.leadMedia}>
              <Image src={card.image} alt={card.alt} width={840} height={560} />
            </div>
            <div className={styles.leadText}>
              <h2>{card.title}</h2>
              <p className={styles.leadParagraph}>{card.paragraph}</p>
              <Button href={`/p/${card.projectId}`}>Validar</Button>
            </div>
          </div>
        </RevealOnScroll>
      ))}
    </section>
  );
}
