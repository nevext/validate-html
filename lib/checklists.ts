import type { ContentType } from "./firestore";

export type QuestionType = "stars" | "boolean";

export interface ChecklistQuestion {
  key: string;
  label: string;
  type: QuestionType;
}

export const checklists: Record<ContentType, ChecklistQuestion[]> = {
  link: [
    { key: "aparencia", label: "Aparência geral", type: "stars" },
    { key: "mobile", label: "Funcionou bem no celular", type: "stars" },
    { key: "links", label: "Algum botão ou link que não funcionou?", type: "boolean" },
    { key: "texto", label: "O texto estava claro", type: "stars" },
    { key: "velocidade", label: "Carregou rápido", type: "stars" },
  ],
  file: [
    { key: "instalacao", label: "Instalou sem problema", type: "boolean" },
    { key: "estabilidade", label: "Travou ou fechou sozinho?", type: "boolean" },
    { key: "toque", label: "Botões responderam bem ao toque", type: "stars" },
    { key: "intuitivo", label: "Fez sentido usar sem precisar de ajuda", type: "stars" },
  ],
  video: [
    { key: "sincronia", label: "Áudio e imagem sincronizados", type: "boolean" },
    { key: "qualidade", label: "Qualidade de imagem e som", type: "stars" },
    { key: "clareza", label: "Conteúdo claro", type: "stars" },
    { key: "duracao", label: "Duração adequada", type: "boolean" },
  ],
  document: [
    { key: "legibilidade", label: "Fácil de ler e encontrar informação", type: "stars" },
    { key: "erros", label: "Tem erros de português ou formatação?", type: "boolean" },
    { key: "precisao", label: "Informações corretas e claras", type: "stars" },
  ],
};
