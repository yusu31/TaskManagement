import type { Task } from '../types/task';
import styles from './TaskCard.module.css';

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

const PRIORITY_STYLE: Record<string, string> = {
  HIGH: styles.badgeHigh,
  MEDIUM: styles.badgeMedium,
  LOW: styles.badgeLow,
};

interface Props {
  task: Task;
}

export function TaskCard({ task }: Props) {
  const isOverdue =
    task.dueDate != null && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div className={styles.card}>
      <p className={styles.title}>{task.title}</p>
      <div className={styles.meta}>
        {task.priority && (
          <span className={`${styles.badge} ${PRIORITY_STYLE[task.priority] ?? ''}`}>
            {PRIORITY_LABELS[task.priority] ?? task.priority}
          </span>
        )}
        {task.dueDate && (
          <span className={`${styles.dueDate} ${isOverdue ? styles.dueDateOverdue : ''}`}>
            {isOverdue ? '⚠ ' : ''}期限: {task.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}
