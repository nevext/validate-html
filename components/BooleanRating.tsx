"use client";

import styles from "./BooleanRating.module.css";

export default function BooleanRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles.options}>
        <button
          type="button"
          aria-label={`Sim para ${label}`}
          className={`${styles.optBtn} ${styles.yes} ${value === 1 ? styles.selected : ""}`}
          onClick={() => onChange(1)}
        >
          Sim
        </button>
        <button
          type="button"
          aria-label={`Não para ${label}`}
          className={`${styles.optBtn} ${styles.no} ${value === 0 ? styles.selected : ""}`}
          onClick={() => onChange(0)}
        >
          Não
        </button>
      </div>
    </div>
  );
}
