import type { ChecklistQuestion } from "./checklists";

export function buildValidationMailto(params: {
  ownerEmail: string;
  projectTitle: string;
  buildLabel: string;
  buildUrl: string;
  questions: ChecklistQuestion[];
  ratings: Record<string, number>;
  bugs: string;
  comment: string;
}): string {
  const subject = `Validate: nova validação em "${params.projectTitle}" (${params.buildLabel})`;

  const answersText = params.questions
    .map((question) => {
      const value = params.ratings[question.key];
      const answer = question.type === "boolean" ? (value === 1 ? "Sim" : "Não") : `${value}/5`;
      return `${question.label}: ${answer}`;
    })
    .join("\n");

  const body = [
    `Link da build: ${params.buildUrl}`,
    "",
    "Checklist:",
    answersText,
    "",
    `Bugs encontrados: ${params.bugs.trim() || "Nenhum relatado"}`,
    "",
    `Comentário: ${params.comment.trim() || "—"}`,
  ].join("\n");

  return `mailto:${params.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
