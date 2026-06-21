"use client";

import { useState } from "react";
import Button from "./Button";
import StarRating from "./StarRating";
import BooleanRating from "./BooleanRating";
import { checklists } from "@/lib/checklists";
import { createValidation, type ContentType } from "@/lib/firestore";
import styles from "./ValidationForm.module.css";

export default function ValidationForm({
  buildId,
  contentType,
}: {
  buildId: string;
  contentType: ContentType;
}) {
  const questions = checklists[contentType];
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [bugs, setBugs] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setRating(key: string, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const answeredAll = questions.every((q) => ratings[q.key] !== undefined);
    if (!answeredAll) {
      setError("Responda todas as perguntas do checklist.");
      return;
    }

    setError("");
    setPending(true);
    try {
      await createValidation({ buildId, ratings, bugs, comment });
      setSubmitted(true);
    } catch {
      setError("Não foi possível enviar sua validação. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.successCard}>
        <h3>Validação enviada!</h3>
        <p>Obrigado pelo seu tempo. Suas respostas já foram registradas. O dono do projeto vai ver tudo no dashboard.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Checklist de validação</h3>

      {questions.map((question) =>
        question.type === "stars" ? (
          <StarRating
            key={question.key}
            label={question.label}
            value={ratings[question.key] ?? 0}
            onChange={(value) => setRating(question.key, value)}
          />
        ) : (
          <BooleanRating
            key={question.key}
            label={question.label}
            value={ratings[question.key] ?? null}
            onChange={(value) => setRating(question.key, value)}
          />
        )
      )}

      <label className={styles.fieldLabel} htmlFor="bugs">
        Bugs encontrados
      </label>
      <textarea
        id="bugs"
        rows={3}
        value={bugs}
        onChange={(e) => setBugs(e.target.value)}
        placeholder="Descreva qualquer bug ou comportamento inesperado (deixe em branco se não encontrou nenhum)"
        className={styles.textarea}
      />

      <label className={styles.fieldLabel} htmlFor="comment">
        Comentário livre
      </label>
      <textarea
        id="comment"
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="O que achou? Sugestões, observações..."
        className={styles.textarea}
      />

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar validação"}
      </Button>
    </form>
  );
}
