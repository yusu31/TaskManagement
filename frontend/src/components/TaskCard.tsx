import { useState } from 'react';
import type { Task } from '../types/task';
import { getLabelStyle } from '../types/task';
import { useLabelColor } from '../context/LabelColorContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import styles from './TaskCard.module.css';

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: '高', MEDIUM: '中', LOW: '低',
};

const PRIORITY_STYLE: Record<string, string> = {
  HIGH: styles.badgeHigh, MEDIUM: styles.badgeMedium, LOW: styles.badgeLow,
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onEdit, onDelete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const colorMap = useLabelColor();

  const isOverdue =
    task.dueDate != null && new Date(task.dueDate) < new Date(new Date().toDateString());

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnd = () => setIsDragging(false);

  return (
    <>
    <div
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* カード上端からはみ出す付箋タブ */}
      {task.labels && task.labels.length > 0 && (
        <div className={styles.labelTabs}>
          {task.labels.map((label, i) => {
            const { color, bg } = getLabelStyle(label, colorMap[label]);
            return (
              <span
                key={label}
                className={styles.labelTab}
                style={{
                  background: bg,
                  color,
                  transform: `rotate(${[-4, 2.5, -3, 3.5, -2][i % 5]}deg)`,
                }}
                title={label}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      {/* タイトル */}
      <p className={styles.title}>{task.title}</p>

      {/* 優先度・期限・操作ボタンを1行に並べる */}
      <div className={styles.meta}>
        {task.priority && (
          <span className={`${styles.badge} ${PRIORITY_STYLE[task.priority] ?? ''}`}>
            {PRIORITY_LABELS[task.priority] ?? task.priority}
          </span>
        )}
        {task.dueDate && (
          <span className={`${styles.dueDate} ${isOverdue ? styles.dueDateOverdue : ''}`}>
            {isOverdue ? '⚠️' : '📅'} {task.dueDate.replace(/-/g, '/')}
          </span>
        )}
        <span className={styles.spacer} />
        <button
          className={styles.editButton}
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          title="編集"
        >
          ✏️
        </button>
        <button
          className={styles.deleteButton}
          onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
          title="削除"
        >
          🗑️
        </button>
      </div>
    </div>

    {showDeleteModal && (
      <DeleteConfirmModal
        taskTitle={task.title}
        onConfirm={() => { setShowDeleteModal(false); onDelete(task.id); }}
        onCancel={() => setShowDeleteModal(false)}
      />
    )}
    </>
  );
}
