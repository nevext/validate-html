"use client";

import { useMemo, useState } from "react";
import Button from "./Button";
import type { ChecklistCategory, ChecklistItem, ChecklistStatus } from "@/lib/mock-data";
import styles from "./ChecklistForm.module.css";

const categoryLabels: Record<ChecklistCategory, string> = {
  design: "Design",
  ux: "UX",
  bugs: "Bugs",
  custom: "Outros",
};

const statusOptions: { value: ChecklistStatus; label: string }[] = [
  { value: "aprovado", label: "Aprovado" },
  { value: "reprovado", label: "Reprovado" },
  { value: "na", label: "N/A" },
];

export default function ChecklistForm({ checklist }: { checklist: ChecklistItem[] }) {
  const [answers, setAnswers] = useState<Record<string, ChecklistStatus>>({});
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<ChecklistCategory, ChecklistItem[]>();
    checklist.forEach((item) => {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    });
    return Array.from(map.entries());
  }, [checklist]);

  function setAnswer(itemId: string, status: ChecklistStatus) {
    setAnswers((prev) => ({ ...prev, [itemId]: status }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewerName.trim()) {
      setError("Preencha seu nome para enviar a validação.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.successCard}>
        <h3>Validação enviada!</h3>
        <p>
          Obrigado, {reviewerName}. Suas respostas foram registradas (este é um protótipo — nada
          foi enviado para um servidor real).
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Checklist de validação</h3>

      {grouped.map(([category, items]) => (
        <div key={category} className={styles.categoryGroup}>
          <h4 className={styles.categoryTitle}>{categoryLabels[category]}</h4>
          {items.map((item) => (
            <div key={item.id} className={styles.checklistItem}>
              <span className={styles.itemLabel}>{item.label}</span>
              <div className={styles.optionGroup}>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.optBtn} ${styles[option.value]} ${
                      answers[item.id] === option.value ? styles.selected : ""
                    }`}
                    onClick={() => setAnswer(item.id, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <label className={styles.fieldLabel} htmlFor="reviewer-name">
        Seu nome
      </label>
      <input
        id="reviewer-name"
        type="text"
        value={reviewerName}
        onChange={(e) => setReviewerName(e.target.value)}
        placeholder="Seu nome"
        className={styles.input}
      />

      <label className={styles.fieldLabel} htmlFor="reviewer-email">
        Seu email (opcional)
      </label>
      <input
        id="reviewer-email"
        type="email"
        value={reviewerEmail}
        onChange={(e) => setReviewerEmail(e.target.value)}
        placeholder="email@exemplo.com"
        className={styles.input}
      />

      <label className={styles.fieldLabel} htmlFor="comment">
        Comentário livre
      </label>
      <textarea
        id="comment"
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Descreva o que observou, sugestões ou problemas encontrados..."
        className={styles.textarea}
      />

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit">Enviar validação</Button>
    </form>
  );
}
