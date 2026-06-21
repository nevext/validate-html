"use client";

import { useEffect, useState } from "react";
import { getValidationsByBuild, type ValidationDoc } from "@/lib/firestore";
import styles from "./PreviousBuildSummary.module.css";

export default function PreviousBuildSummary({ buildId }: { buildId: string }) {
  const [loaded, setLoaded] = useState<{ buildId: string; validations: ValidationDoc[] } | null>(null);

  useEffect(() => {
    let active = true;
    getValidationsByBuild(buildId).then((result) => {
      if (active) setLoaded({ buildId, validations: result });
    });
    return () => {
      active = false;
    };
  }, [buildId]);

  const validations = loaded?.buildId === buildId ? loaded.validations : null;

  if (!validations) {
    return <p className={styles.status}>Carregando histórico...</p>;
  }

  const withFeedback = validations.filter((v) => v.bugs.trim() || v.comment.trim());

  if (withFeedback.length === 0) {
    return <p className={styles.empty}>Nenhum bug ou comentário registrado nesta build.</p>;
  }

  return (
    <ul className={styles.list}>
      {withFeedback.map((validation) => (
        <li key={validation.id} className={styles.item}>
          {validation.bugs.trim() && (
            <p className={styles.bugs}>
              <strong>Bug:</strong> {validation.bugs}
            </p>
          )}
          {validation.comment.trim() && <p className={styles.comment}>{validation.comment}</p>}
        </li>
      ))}
    </ul>
  );
}
