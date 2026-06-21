"use client";

import { useState } from "react";
import Button from "./Button";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>VALIDATE</h1>
        <p className={styles.heroDesc}>
          Uma plataforma para validação rápida de seus projetos web por outros colegas, de maneira
          simples e eficaz.{" "}
          <a
            href="#"
            className={styles.heroLink}
            onClick={(e) => {
              e.preventDefault();
              setShowInfo(true);
            }}
          >
            Leia mais
          </a>
        </p>
      </section>

      {showInfo && (
        <section className={styles.infoCard}>
          <div className="container">
            <h2>O que é o Validate?</h2>
            <p>
              Este site permite que você submeta seus projetos web para revisão rápida por outros
              colegas. O objetivo é promover feedback ágil, simples e colaborativo.
            </p>
            <Button onClick={() => setShowInfo(false)}>Fechar</Button>
          </div>
        </section>
      )}
    </>
  );
}
