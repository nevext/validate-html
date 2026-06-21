import type { ChecklistQuestion } from "./checklists";

export interface ChecklistAnswerItem {
  label: string;
  answer: string;
}

export function formatChecklistAnswers(
  questions: ChecklistQuestion[],
  ratings: Record<string, number>
): ChecklistAnswerItem[] {
  return questions.map((question) => {
    const value = ratings[question.key];
    const answer = question.type === "boolean" ? (value === 1 ? "Sim" : "Não") : `${value ?? "—"}/5`;
    return { label: question.label, answer };
  });
}

export interface ValidationEmailPayload {
  ownerEmail: string;
  projectTitle: string;
  buildLabel: string;
  buildUrl: string;
  answers: ChecklistAnswerItem[];
  bugs: string;
  comment: string;
}

// Disparo "fire-and-forget": uma falha aqui nunca deve impedir o validador de
// ver a confirmação de que a validação foi salva — o email é um bônus.
export async function sendValidationEmail(payload: ValidationEmailPayload): Promise<void> {
  if (!payload.ownerEmail) return;

  try {
    const response = await fetch("/api/send-validation-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      console.warn("Não foi possível notificar o dono por email:", data?.error ?? response.status);
    }
  } catch (error) {
    console.warn("Não foi possível notificar o dono por email:", error);
  }
}
