import { useState, useRef } from 'react';
import type { Task, Status } from '../types/task';
import { TaskCard } from './TaskCard';
import styles from './Column.module.css';

interface ColumnDef {
  status: Status;
  label: string;
  colorBar: string;
  titleColor: string;
}

type SortKey = 'pri' | 'due' | null;

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

interface Props {
  column: ColumnDef;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onAddTask: (status: Status) => void;
  onDrop: (taskId: number, newStatus: Status, toIndex: number) => void;
}

export function Column({ column, tasks, onEdit, onAddTask, onDrop }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  // ドロップ直前に最後に示していたインデックスを記録するためのRef
  const lastDropIndexRef = useRef<number | null>(null);

  const handleSort = (key: 'pri' | 'due') => {
    setSortKey((prev) => (prev === key ? null : key));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortKey === 'pri') {
      const diff = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
      if (diff !== 0) return diff;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortKey === 'due') {
      if (!a.dueDate && !b.dueDate) {
        return (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
      }
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const diff = a.dueDate.localeCompare(b.dueDate);
      if (diff !== 0) return diff;
      return (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
    }
    // ソートなし → App.tsx が管理する順番をそのまま使う（return 0 = 元の順番を維持）
    return 0;
  });

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColumnDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropIndex(null);
      lastDropIndexRef.current = null;
    }
  };

  const handleColumnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData('taskId'));
    // 最後に記録したインデックスを使う。なければ末尾に追加
    const di = lastDropIndexRef.current ?? sortedTasks.length;
    setDropIndex(null);
    lastDropIndexRef.current = null;
    if (taskId) onDrop(taskId, column.status, di);
  };

  const handleZoneDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndex(index);
    lastDropIndexRef.current = index;
  };

  return (
    <div
      className={`${styles.column} ${dropIndex !== null ? styles.columnDragOver : ''}`}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleColumnDragLeave}
      onDrop={handleColumnDrop}
    >
      <div className={styles.colorBar} style={{ background: column.colorBar }} />

      <div className={styles.header}>
        <h2 className={styles.title} style={{ color: column.titleColor }}>
          {column.label}
        </h2>
        <span className={styles.count}>{tasks.length}</span>
        <button
          className={styles.addTaskBtn}
          onClick={() => onAddTask(column.status)}
          title={`${column.label}にタスクを追加`}
        >
          ✏️
        </button>
      </div>

      <div className={styles.sortRow}>
        <button
          className={`${styles.sortBtn} ${sortKey === 'pri' ? styles.sortBtnActive : ''}`}
          onClick={() => handleSort('pri')}
        >
          優先度順
        </button>
        <button
          className={`${styles.sortBtn} ${sortKey === 'due' ? styles.sortBtnActive : ''}`}
          onClick={() => handleSort('due')}
        >
          期限順
        </button>
      </div>

      <div className={styles.cards}>
        {sortedTasks.length === 0 ? (
          <p className={styles.empty}>タスクがありません</p>
        ) : (
          <>
            <div
              className={`${styles.dropZone} ${dropIndex === 0 ? styles.dropZoneActive : ''}`}
              onDragOver={(e) => handleZoneDragOver(e, 0)}
            />
            {sortedTasks.map((task, i) => (
              <>
                <TaskCard key={task.id} task={task} onEdit={onEdit} />
                <div
                  key={`zone-${task.id}`}
                  className={`${styles.dropZone} ${dropIndex === i + 1 ? styles.dropZoneActive : ''}`}
                  onDragOver={(e) => handleZoneDragOver(e, i + 1)}
                />
              </>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
