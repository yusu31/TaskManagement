import { useState } from 'react';
import type { Task } from '../types/task';
import { getLabelStyle } from '../types/task';
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
      {/* 付箋ラベル */}
      {task.labels && task.labels.length > 0 && (
        <div className={styles.labelBars}>
          {task.labels.map((label) => {
            const { color, bg } = getLabelStyle(label);
            return (
              <span
                key={label}
                className={styles.labelBar}
                style={{ background: bg, color }}
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

      {/* 優先度・期限 */}
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
      </div>

      {/* 操作ボタン（右下） */}
      <div className={styles.cardActions}>
        <button
          className={styles.editButton}
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
        >
          編集
        </button>
        <button
          className={styles.deleteButton}
          onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
        >
          削除
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
