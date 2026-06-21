import type { BuildStatus } from "@/lib/firestore";
import styles from "./StatusBadge.module.css";

export const statusLabels: Record<BuildStatus, string> = {
  green: "Aprovado",
  yellow: "Atenção",
  red: "Com problemas",
  blue: "Em revisão",
  gray: "Sem avaliação",
};

export default function StatusBadge({ status }: { status: BuildStatus }) {
  return (
    <span className={styles.badge}>
      <span className={`${styles.dot} ${styles[status]}`} />
      {statusLabels[status]}
    </span>
  );
}
