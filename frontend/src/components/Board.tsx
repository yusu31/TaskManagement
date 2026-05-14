import type { Task } from '../types/task';
import { Column } from './Column';
import styles from './Board.module.css';

const COLUMN_DEFS = [
  { status: 'TODO',        label: '未着手', colorBar: '#a78bfa', titleColor: '#6d28d9' },
  { status: 'IN_PROGRESS', label: '進行中', colorBar: '#60a5fa', titleColor: '#1d4ed8' },
  { status: 'DONE',        label: '完了',   colorBar: '#34d399', titleColor: '#059669' },
] as const;

interface Props {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export function Board({ tasks, loading, error }: Props) {
  if (loading) return <p className={styles.loading}>読み込み中...</p>;
  if (error)   return <p className={styles.error}>{error}</p>;

  const tasksByStatus = Object.fromEntries(
    COLUMN_DEFS.map((col) => [col.status, tasks.filter((t) => t.status === col.status)])
  );

  return (
    <div className={styles.board}>
      {COLUMN_DEFS.map((col) => (
        <Column key={col.status} column={col} tasks={tasksByStatus[col.status] ?? []} />
      ))}
    </div>
  );
}
