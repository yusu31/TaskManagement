import type { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import styles from './Column.module.css';

interface ColumnDef {
  status: string;
  label: string;
  colorBar: string;
  titleColor: string;
}

interface Props {
  column: ColumnDef;
  tasks: Task[];
}

export function Column({ column, tasks }: Props) {
  return (
    <div className={styles.column}>
      <div className={styles.colorBar} style={{ background: column.colorBar }} />
      <div className={styles.header}>
        <h2 className={styles.title} style={{ color: column.titleColor }}>
          {column.label}
        </h2>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      <div className={styles.cards}>
        {tasks.length === 0 ? (
          <p className={styles.empty}>タスクがありません</p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
