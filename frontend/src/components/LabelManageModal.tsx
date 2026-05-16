import { useState } from 'react';
import type { Task } from '../types/task';
import { getLabelStyle } from '../types/task';
import { useLabelColor } from '../context/LabelColorContext';
import { updateTask } from '../api/taskApi';
import styles from './LabelManageModal.module.css';

interface Props {
  allLabels: string[];
  allTasks: Task[];
  onClose: () => void;
  onUpdated: () => void;
  onAddLabel: (label: string) => void;
  onDeleteCustomLabel: (label: string) => void;
}

export function LabelManageModal({
  allLabels, allTasks, onClose, onUpdated, onAddLabel, onDeleteCustomLabel,
}: Props) {
  const colorMap = useLabelColor();
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = () => {
    const name = newLabel.trim();
    if (!name) return;
    if (allLabels.includes(name)) {
      setError(`「${name}」はすでに存在します`);
      return;
    }
    onAddLabel(name);
    setNewLabel('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  const handleDelete = async (label: string) => {
    setDeletingLabel(label);
    setError(null);
    try {
      const targetTasks = allTasks.filter((t) => t.labels.includes(label));
      // タスクに使われているラベルはAPIで全タスクから除去する
      if (targetTasks.length > 0) {
        await Promise.all(
          targetTasks.map((t) =>
            updateTask(t.id, {
              title: t.title,
              description: t.description ?? undefined,
              priority: t.priority,
              status: t.status,
              dueDate: t.dueDate ?? undefined,
              labels: t.labels.filter((l) => l !== label),
            })
          )
        );
        onUpdated();
      }
      // localStorageのカスタムラベルからも除去する
      onDeleteCustomLabel(label);
    } catch {
      setError(`「${label}」の削除に失敗しました。`);
    } finally {
      setDeletingLabel(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <h2 className={styles.title}>🏷️ ラベルを管理</h2>

        {/* ラベル追加フォーム */}
        <div className={styles.addRow}>
          <input
            type="text"
            className={styles.addInput}
            placeholder="新しいラベル名を入力..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.addBtn} onClick={handleAdd}>＋ 追加</button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {allLabels.length === 0 ? (
          <p className={styles.empty}>ラベルがありません</p>
        ) : (
          <ul className={styles.list}>
            {allLabels.map((label) => {
              const { color, bg } = getLabelStyle(label, colorMap[label]);
              const count = allTasks.filter((t) => t.labels.includes(label)).length;
              return (
                <li key={label} className={styles.item}>
                  <span className={styles.chip} style={{ background: bg, color }}>
                    {label}
                  </span>
                  <span className={styles.count}>
                    {count > 0 ? `${count}件で使用中` : '未使用'}
                  </span>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(label)}
                    disabled={deletingLabel === label}
                  >
                    {deletingLabel === label ? '削除中...' : '✕ 削除'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
