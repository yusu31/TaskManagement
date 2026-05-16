import { useState } from 'react';
import type { CreateTaskInput, Priority, Status } from '../types/task';
import { getLabelStyle } from '../types/task';
import { useLabelColor } from '../context/LabelColorContext';
import { createTask } from '../api/taskApi';
import styles from './TaskCreateModal.module.css';

interface Props {
  onClose: () => void;
  onCreated: () => void;
  initialStatus?: Status;
  allLabels?: string[];  // 過去に登録されたラベル一覧（サジェスト表示用）
}

export function TaskCreateModal({ onClose, onCreated, initialStatus, allLabels = [] }: Props) {
  const colorMap = useLabelColor();
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]       = useState<Priority>('MEDIUM');
  const status: Status                = initialStatus ?? 'TODO';
  const [dueDate, setDueDate]         = useState('');
  const [labels, setLabels]           = useState<string[]>([]);
  const [labelInput, setLabelInput]   = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // 既存チップのクリックで選択/解除トグル
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

  // サジェスト表示するラベル：過去のラベル + 今セッションで追加したラベル（重複除去）
  const suggestLabels = [...new Set([...allLabels, ...labels])].sort((a, b) =>
    a.localeCompare(b, 'ja')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input: CreateTaskInput = {
      title,
      description: description || undefined,
      priority,
      status,
      dueDate: dueDate || undefined,
      labels,
    };
    try {
      await createTask(input);
      onCreated();
      onClose();
    } catch {
      setError('登録に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <h2 className={styles.title}>タスクを追加</h2>

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
              {/* サジェストチップ（過去のラベル一覧：クリックで選択/解除） */}
              {suggestLabels.length > 0 && (
                <div className={styles.existingLabels}>
                  {suggestLabels.map((name) => {
                    const { color, bg } = getLabelStyle(name, colorMap[name]);
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
              {/* 新しいラベルを入力して追加 */}
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
              {submitting ? '保存中...' : '保存する'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
