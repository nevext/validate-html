"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getProjectsByOwner } from "@/lib/firestore";
import styles from "./page.module.css";

const cards = [
  {
    href: "/create",
    title: "Submeter novo projeto",
    description: "Crie um projeto e gere o link da primeira build.",
  },
  {
    href: "/dashboard",
    title: "Projetos em andamento",
    description: "Acompanhe builds, status e validações recebidas.",
    showCount: true,
  },
  {
    href: "/projects/tutorial-submissao",
    title: "Tutorial de submissão",
    description: "Como criar um projeto e compartilhar o link.",
  },
  {
    href: "/projects/tutorial-teste",
    title: "Tutorial de teste",
    description: "Como funciona o checklist pra quem valida.",
  },
];

export default function ProjectsHubPage() {
  const { user } = useAuth();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getProjectsByOwner(user.uid).then((projects) => setCount(projects.length));
  }, [user]);

  return (
    <section>
      <h1 className={styles.title}>Projetos</h1>
      <p className={styles.subtitle}>O que você quer fazer?</p>
      <div className={styles.grid}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className={styles.card}>
            <div className={styles.cardTitle}>{card.title}</div>
            <p className={styles.cardDescription}>{card.description}</p>
            {card.showCount && count !== null && (
              <span className={styles.badge}>
                {count} {count === 1 ? "projeto" : "projetos"}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
