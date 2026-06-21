"use client";

import { useState } from "react";
import styles from "./StarRating.module.css";

const STAR_VALUES = [1, 2, 3, 4, 5];

export default function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles.stars} onMouseLeave={() => setHovered(0)} role="group" aria-label={`Nota de ${label}`}>
        {STAR_VALUES.map((star) => (
          <span
            key={star}
            role="button"
            aria-label={`${star} de 5 estrelas para ${label}`}
            className={`${styles.star} ${star <= display ? styles.selected : ""}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
