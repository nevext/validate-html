"use client";

import { useState } from "react";
import Button from "./Button";
import StarRating from "./StarRating";
import { createValidation } from "@/lib/firestore";
import styles from "./ValidationForm.module.css";

export default function ValidationForm({ projectId }: { projectId: string }) {
  const [designRating, setDesignRating] = useState(0);
  const [uxRating, setUxRating] = useState(0);
  const [bugs, setBugs] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (designRating === 0 || uxRating === 0) {
      setError("Dê uma nota de 1 a 5 estrelas para Design e UX.");
      return;
    }

    setError("");
    setPending(true);
    try {
      await createValidation({ projectId, designRating, uxRating, bugs, comment });
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
        <p>Obrigado pelo seu tempo. Suas respostas já chegaram para o dono do projeto.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Checklist de validação</h3>

      <StarRating label="Design" value={designRating} onChange={setDesignRating} />
      <StarRating label="UX" value={uxRating} onChange={setUxRating} />

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
        placeholder="O que achou? Sugestões, observações sobre design ou UX..."
        className={styles.textarea}
      />

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar validação"}
      </Button>
    </form>
  );
}
