import { useState } from 'react';
import type { Task, UpdateTaskInput, Priority } from '../types/task';
import { getLabelStyle } from '../types/task';
import { updateTask } from '../api/taskApi';
import styles from './TaskCreateModal.module.css';

interface Props {
  task: Task;
  onClose: () => void;
  onUpdated: () => void;
  allLabels?: string[];
}

export function TaskEditModal({ task, onClose, onUpdated, allLabels = [] }: Props) {
  const [title, setTitle]             = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority]       = useState<Priority>(task.priority);
  const [dueDate, setDueDate]         = useState(task.dueDate ?? '');
  const [labels, setLabels]           = useState<string[]>(task.labels ?? []);
  const [labelInput, setLabelInput]   = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleLabelToggle = (name: string) => {
    setLabels((prev) =>
      prev.includes(name) ? prev.filter((l) => l !== name) : [...prev, name]
    );
  };

  const handleAddLabel = () => {
    const name = labelInput.trim();
    if (!name) return;
    if (!labels.includes(name)) setLabels((prev) => [...prev, name]);
    setLabelInput('');
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddLabel(); }
  };

  // サジェスト：全既存ラベル + このタスクのラベル（重複除去・50音順）
  const suggestLabels = [...new Set([...allLabels, ...labels])].sort((a, b) =>
    a.localeCompare(b, 'ja')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input: UpdateTaskInput = {
      title,
      description: description || undefined,
      priority,
      status: task.status,
      dueDate: dueDate || undefined,
      labels,
    };
    try {
      await updateTask(task.id, input);
      onUpdated();
      onClose();
    } catch {
      setError('更新に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <h2 className={styles.title}>タスクを編集</h2>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* タイトル */}
          <label className={styles.fieldLabel}>
            タイトル <span className={styles.required}>*</span>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスク名を入力"
              required
            />
          </label>

          {/* 説明 */}
          <label className={styles.fieldLabel}>
            説明
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳細メモ（任意）"
              rows={3}
            />
          </label>

          {/* 優先度 */}
          <div className={styles.fieldLabel}>
            優先度
            <div className={styles.priorityGroup}>
              <button type="button"
                className={`${styles.priorityBtn} ${priority === 'LOW' ? styles.priorityBtnLow : ''}`}
                onClick={() => setPriority('LOW')}>🟢 低</button>
              <button type="button"
                className={`${styles.priorityBtn} ${priority === 'MEDIUM' ? styles.priorityBtnMedium : ''}`}
                onClick={() => setPriority('MEDIUM')}>🟡 中</button>
              <button type="button"
                className={`${styles.priorityBtn} ${priority === 'HIGH' ? styles.priorityBtnHigh : ''}`}
                onClick={() => setPriority('HIGH')}>🔴 高</button>
            </div>
          </div>

          {/* 期限 */}
          <label className={styles.fieldLabel}>
            期限
            <input
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>

          {/* ラベル */}
          <div className={styles.fieldLabel}>
            ラベル
            <div className={styles.labelManageWrap}>
              {suggestLabels.length > 0 && (
                <div className={styles.existingLabels}>
                  {suggestLabels.map((name) => {
                    const { color, bg } = getLabelStyle(name);
                    const active = labels.includes(name);
                    return (
                      <span
                        key={name}
                        className={styles.labelSelChip}
                        style={active
                          ? { background: color, color: '#fff', borderColor: color }
                          : { background: bg, color, borderColor: 'transparent' }
                        }
                        onClick={() => handleLabelToggle(name)}
                      >
                        {name}{active ? ' ✓' : ''}
                      </span>
                    );
                  })}
                </div>
              )}
              <div className={styles.labelAddRow}>
                <input
                  type="text"
                  className={styles.labelAddInput}
                  placeholder="新しいラベルを入力して追加..."
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={handleLabelKeyDown}
                />
                <button type="button" className={styles.labelAddBtn} onClick={handleAddLabel}>
                  ＋ 追加
                </button>
              </div>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? '更新中...' : '更新する'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
