"use client";

import styles from "../admin.module.css";

export default function ConfirmDialog({
  open,
  title = "Confirmer l'action",
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? `${styles.btn} ${styles.btnDanger}`
      : `${styles.btn} ${styles.btnPrimary}`;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-dialog-title" className={styles.modalTitle}>
          {title}
        </h3>
        <p className={styles.modalText}>{message}</p>
        <div className={styles.formActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button type="button" className={confirmClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
