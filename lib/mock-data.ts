export type ContentType = "site" | "video" | "document" | "executable";

export type ChecklistCategory = "design" | "ux" | "bugs" | "custom";

export interface ChecklistItem {
  id: string;
  label: string;
  category: ChecklistCategory;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  contentUrl: string;
  createdBy: string;
  createdAt: string;
  checklist: ChecklistItem[];
}

export type ChecklistStatus = "aprovado" | "reprovado" | "na";

export interface ChecklistAnswer {
  itemId: string;
  status: ChecklistStatus;
}

export interface ValidationResponse {
  id: string;
  projectId: string;
  reviewerName: string;
  reviewerEmail?: string;
  answers: ChecklistAnswer[];
  comment: string;
  submittedAt: string;
}

const designItems: ChecklistItem[] = [
  { id: "design-1", label: "A identidade visual está consistente em todas as telas", category: "design" },
  { id: "design-2", label: "Contraste de cores e legibilidade estão adequados", category: "design" },
];

const uxItems: ChecklistItem[] = [
  { id: "ux-1", label: "A navegação é intuitiva e direta", category: "ux" },
  { id: "ux-2", label: "Os textos e instruções são claros", category: "ux" },
];

const bugItems: ChecklistItem[] = [
  { id: "bugs-1", label: "Nenhum erro visual ou de funcionamento foi encontrado", category: "bugs" },
  { id: "bugs-2", label: "O conteúdo funciona em diferentes tamanhos de tela", category: "bugs" },
];

export const defaultChecklist: ChecklistItem[] = [...designItems, ...uxItems, ...bugItems];

export const projects: Project[] = [
  {
    id: "glossario-ciesa",
    name: "Glossário para o CIESA",
    description: "Glossário colaborativo de termos acadêmicos do CIESA, com busca e adição livre de novos termos.",
    contentType: "site",
    contentUrl: "https://nevext.github.io/glossario-ingles-ciesa/",
    createdBy: "Nevext",
    createdAt: "2026-02-22T08:18:52.847Z",
    checklist: defaultChecklist,
  },
  {
    id: "bemvindo-ciesa",
    name: "Bem-vindo ao CIESA",
    description: "Site institucional de boas-vindas para os novos estudantes do CIESA.",
    contentType: "site",
    contentUrl: "https://nevext.github.io/site-boas-vindas-ciesa/",
    createdBy: "Nevext",
    createdAt: "2026-02-22T08:20:02.210Z",
    checklist: defaultChecklist,
  },
  {
    id: "abc123",
    name: "App Mobile Beta",
    description: "Build de testes do app mobile, ainda em fase fechada de validação interna.",
    contentType: "executable",
    contentUrl: "https://example.com/downloads/app-mobile-beta.apk",
    createdBy: "Nevext",
    createdAt: "2026-06-10T12:00:00.000Z",
    checklist: defaultChecklist,
  },
];

export const responses: ValidationResponse[] = [
  {
    id: "resp-1",
    projectId: "glossario-ciesa",
    reviewerName: "Marina Souza",
    reviewerEmail: "marina.souza@example.com",
    answers: [
      { itemId: "design-1", status: "aprovado" },
      { itemId: "design-2", status: "aprovado" },
      { itemId: "ux-1", status: "aprovado" },
      { itemId: "ux-2", status: "reprovado" },
      { itemId: "bugs-1", status: "aprovado" },
      { itemId: "bugs-2", status: "na" },
    ],
    comment: "Achei o visual bem limpo, mas a busca não deixa claro o que fazer quando o termo não existe.",
    submittedAt: "2026-02-23T10:05:00.000Z",
  },
  {
    id: "resp-2",
    projectId: "glossario-ciesa",
    reviewerName: "Pedro Lima",
    answers: [
      { itemId: "design-1", status: "aprovado" },
      { itemId: "design-2", status: "aprovado" },
      { itemId: "ux-1", status: "aprovado" },
      { itemId: "ux-2", status: "aprovado" },
      { itemId: "bugs-1", status: "aprovado" },
      { itemId: "bugs-2", status: "aprovado" },
    ],
    comment: "Funcionou bem no celular e no notebook. Sem bugs encontrados.",
    submittedAt: "2026-02-24T15:32:00.000Z",
  },
  {
    id: "resp-3",
    projectId: "bemvindo-ciesa",
    reviewerName: "Camila Alves",
    reviewerEmail: "camila.alves@example.com",
    answers: [
      { itemId: "design-1", status: "aprovado" },
      { itemId: "design-2", status: "reprovado" },
      { itemId: "ux-1", status: "aprovado" },
      { itemId: "ux-2", status: "aprovado" },
      { itemId: "bugs-1", status: "aprovado" },
      { itemId: "bugs-2", status: "aprovado" },
    ],
    comment: "O texto sobre o fundo da foto da cidade fica com pouco contraste em alguns trechos.",
    submittedAt: "2026-02-25T09:14:00.000Z",
  },
  {
    id: "resp-4",
    projectId: "abc123",
    reviewerName: "Diego Ferreira",
    answers: [
      { itemId: "design-1", status: "aprovado" },
      { itemId: "design-2", status: "aprovado" },
      { itemId: "ux-1", status: "reprovado" },
      { itemId: "ux-2", status: "reprovado" },
      { itemId: "bugs-1", status: "reprovado" },
      { itemId: "bugs-2", status: "na" },
    ],
    comment: "O app trava ao abrir a tela de perfil em telas menores. Fluxo de cadastro também confunde.",
    submittedAt: "2026-06-11T18:40:00.000Z",
  },
  {
    id: "resp-5",
    projectId: "abc123",
    reviewerName: "Beatriz Nogueira",
    reviewerEmail: "bia.nogueira@example.com",
    answers: [
      { itemId: "design-1", status: "aprovado" },
      { itemId: "design-2", status: "aprovado" },
      { itemId: "ux-1", status: "aprovado" },
      { itemId: "ux-2", status: "na" },
      { itemId: "bugs-1", status: "reprovado" },
      { itemId: "bugs-2", status: "aprovado" },
    ],
    comment: "Visual ficou ótimo. Ainda encontrei um bug ao girar a tela durante o cadastro.",
    submittedAt: "2026-06-12T11:02:00.000Z",
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function getResponsesByProjectId(projectId: string): ValidationResponse[] {
  return responses.filter((response) => response.projectId === projectId);
}

export function getApprovalRate(projectId: string): number | null {
  const projectResponses = getResponsesByProjectId(projectId);
  const allAnswers = projectResponses.flatMap((response) => response.answers);
  const decisive = allAnswers.filter((answer) => answer.status !== "na");
  if (decisive.length === 0) return null;
  const approved = decisive.filter((answer) => answer.status === "aprovado").length;
  return Math.round((approved / decisive.length) * 100);
}
