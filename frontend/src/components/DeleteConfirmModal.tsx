import styles from './DeleteConfirmModal.module.css';

interface Props {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ taskTitle, onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.icon}>🗑️</p>
        <h2 className={styles.title}>タスクを削除しますか？</h2>
        <p className={styles.message}>「{taskTitle}」を削除します。この操作は元に戻せません。</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            キャンセル
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
